import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { corsHeaders, getApiKey, handleError } from '../utils';
import { rateLimiter, calculateRetryDelay } from '@/lib/utils/rate-limiter';

const apiKey = getApiKey();
const ai = new GoogleGenAI({ apiKey });

const SYSTEM_MESSAGE = `You are an AI specialized in generating music industry contracts. Your task is to create a complete, professional contract based on the provided details and contract type. 

You have access to real-time web information to reference current industry standards, typical contract terms, and legal requirements. Use this information to ensure the generated contract aligns with current industry practices and legal standards.

Follow these guidelines:

1. Generate ONLY the contract text. Do not include any explanations, metadata, or additional text outside the contract itself.
2. Use real-time web information to research current industry standards, typical rates, and standard contract terms for the specific contract type.
3. Begin the contract with a clear title and introduction defining the parties and effective date.
4. Use proper legal formatting with numbered clauses and sub-clauses.
5. Include all necessary components based on the contract type (e.g., scope of work, payment terms, ownership rights, termination clauses).
6. Customize the contract using the provided inputs and details, while ensuring terms align with current industry standards.
7. Use clear, concise language appropriate for legal documents.
8. End the contract with signature blocks for all relevant parties.
9. Do not include any text or formatting that is not part of the actual contract.`;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Adjusted for free tier: 60 requests/minute
const MAX_RETRIES = 5;

interface Content {
  text: string;
}

interface ContractDetails {
  id: string;
  title: string;
  description: string;
  fields: Record<string, { label: string; type: string }>;
}

interface ContractInputs {
  [key: string]: string | number;
}

const cache = new Map<string, { value: string; timestamp: number }>();
// Extended cache TTL to 24 hours for better performance and reduced API calls
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

function cacheGet(key: string): string | null {
  const cached = cache.get(key);
  if (cached) {
    const isExpired = Date.now() - cached.timestamp > CACHE_TTL;
    if (!isExpired) {
      return cached.value;
    }
    cache.delete(key);
  }
  return null;
}

function cacheSet(key: string, value: string): void {
  cache.set(key, { value, timestamp: Date.now() });
}

async function generateWithRetry(
  content: Content[],
  retryCount = 0
): Promise<string> {
  const cacheKey = JSON.stringify(content);
  const cachedResponse = cacheGet(cacheKey);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    // Rate limit check before making request
    await rateLimiter.waitIfNeeded();

    const contents = content.map((item) => item.text).join('\n\n');
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents,
      config: {
        tools: [
          {
            googleSearch: {},
          },
        ],
      },
    });
    const responseText = result.text ?? '';
    if (!responseText) {
      throw new Error('No response text received from API');
    }
    cacheSet(cacheKey, responseText);
    return responseText;
  } catch (error: unknown) {
    const errorStatus = (error as { status?: number })?.status;
    
    // Check if it's a daily quota error (don't retry, quota won't reset until tomorrow)
    if (errorStatus === 429) {
      const errorString = JSON.stringify(error);
      const isDailyQuota = 
        errorString.includes('GenerateRequestsPerDayPerProjectPerModel') ||
        errorString.includes('free_tier_requests') ||
        errorString.includes('quotaValue');
      
      if (isDailyQuota) {
        // Don't retry daily quota errors - they won't reset until tomorrow
        throw error;
      }
    }
    
    if (
      error instanceof Error &&
      errorStatus &&
      (errorStatus === 429 || errorStatus === 503) &&
      retryCount < MAX_RETRIES
    ) {
      // Calculate retry delay based on rate limits
      let waitTime: number;
      try {
        const errorDetails = error as {
          error?: {
            details?: Array<{
              '@type'?: string;
              retryDelay?: string;
            }>;
          };
        };
        const retryInfo = errorDetails?.error?.details?.find(
          (detail) =>
            detail['@type'] === 'type.googleapis.com/google.rpc.RetryInfo'
        );
        waitTime = calculateRetryDelay(
          retryCount,
          retryInfo?.retryDelay
        );
      } catch {
        // Fall back to calculated delay
        waitTime = calculateRetryDelay(retryCount);
      }
      console.log(
        `Rate limit or service unavailable. Retrying in ${Math.ceil(waitTime / 1000)}s... (Attempt ${retryCount + 1}/${MAX_RETRIES})`
      );
      await delay(waitTime);
      return generateWithRetry(content, retryCount + 1);
    }
    throw new Error((error as Error)?.message ?? 'An unknown error occurred.');
  }
}

export async function POST(req: NextRequest) {
  if (req.method === 'OPTIONS') {
    return NextResponse.json({}, { headers: corsHeaders() });
  }

  try {
    if (req.headers.get('content-type') !== 'application/json') {
      return NextResponse.json(
        { error: 'Invalid content type. Please use application/json.' },
        { status: 400, headers: corsHeaders() }
      );
    }

    const {
      contractDetails,
      contractInputs,
    }: { contractDetails: ContractDetails; contractInputs: ContractInputs } =
      await req.json();

    if (!contractDetails || !contractInputs) {
      return NextResponse.json(
        {
          error:
            'Missing contract details or inputs. Please provide all necessary information.',
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    const content: Content[] = [
      { text: SYSTEM_MESSAGE },
      { text: `Contract Type: ${contractDetails.id}` },
      { text: `Contract Details: ${JSON.stringify(contractDetails)}` },
      { text: `Contract Inputs: ${JSON.stringify(contractInputs)}` },
      {
        text: 'Generate ONLY the complete contract text based on the provided information. Do not include any additional explanations or text outside the contract itself.',
      },
    ];

    const cacheKey = JSON.stringify(content);
    const cachedResponse = cacheGet(cacheKey);
    if (cachedResponse) {
      return NextResponse.json(
        {
          generatedContract: cachedResponse,
          message: 'Contract generated successfully (from cache).',
        },
        { status: 200, headers: corsHeaders() }
      );
    }

    const generatedContract = await generateWithRetry(content);
    cacheSet(cacheKey, generatedContract);

    return NextResponse.json(
      { generatedContract, message: 'Contract generated successfully.' },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error: unknown) {
    const { errorMessage, statusCode } = handleError(error);
    return NextResponse.json(
      {
        error: errorMessage,
        message: 'Failed to generate contract. Please try again later.',
      },
      { status: statusCode, headers: corsHeaders() }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}
