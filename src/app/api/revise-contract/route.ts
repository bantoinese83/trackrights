import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { corsHeaders, getApiKey, handleError } from '../utils';
import { optimizeContractText } from '@/lib/utils/contract-optimizer';
import { rateLimiter, calculateRetryDelay } from '@/lib/utils/rate-limiter';

// Set max duration for Vercel serverless function (60 seconds)
export const maxDuration = 60;

const apiKey = getApiKey();
const ai = new GoogleGenAI({ apiKey });

const SYSTEM_MESSAGE = `You are an expert seasoned music industry lawyer specialized in revising music industry contracts in favor of various music professionals, including artists, producers, performers, songwriters, and managers. Your task is to rewrite the given contract based on the provided instructions, making it more favorable for the specific music professional while still maintaining a fair and legal agreement. 

You have access to real-time web information to reference current industry standards, legal precedents, and best practices. Use this information to ensure your revisions align with current industry norms and legal requirements.

Follow these guidelines:

1. Carefully analyze the original contract and the revision instructions.
2. Use real-time web information to research current industry standards, typical royalty rates, and legal precedents relevant to the contract type.
3. Identify key areas where the contract can be improved for the benefit of the specific music professional role.
4. Rewrite relevant clauses to align with the interests of the music professional, as per the instructions, while referencing current industry practices.
5. Ensure that the revised contract remains legally sound and doesn't introduce unfair or unethical terms.
6. Maintain a professional and formal tone throughout the revised contract.
7. Highlight any significant changes you've made in the revision process.
8. Consider the unique needs and concerns of different music industry roles (e.g., artists, producers, performers, songwriters, managers) when revising the contract.
9. Address specific issues related to royalties, creative control, ownership rights, and other relevant aspects for various music industry professionals.
10. Ensure that the revised contract is balanced and considers the interests of all parties involved while prioritizing the specified music professional's needs.
11. Include explanations for major changes, helping the music professional understand the improvements made.
12. When referencing industry standards or legal information, cite your sources.

Format your response using standard contract structure and language. Use clear and concise language that is easily understandable by both parties, regardless of their level of experience in the music industry.`;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Adjusted for free tier: 60 requests/minute
const MAX_RETRIES = 5;

interface RevisionRequest {
  originalContract: string;
  instructions: string;
  role: string;
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
  content: string[],
  retryCount = 0
): Promise<string> {
  const cacheKey = JSON.stringify(content);
  const cachedResponse = cacheGet(cacheKey);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    // Rate limit check before making request (minimal delay to avoid timeouts)
    await rateLimiter.waitIfNeeded();

    // Remove googleSearch tool to speed up processing and avoid timeouts
    // Use streaming timeout: 50 seconds max for API call
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout after 50 seconds')), 50000);
    });

    const result = await Promise.race([
      ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: content.join('\n\n'),
      }),
      timeoutPromise,
    ]);
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
    throw error;
  }
}

export async function POST(req: NextRequest) {
  if (req.method === 'OPTIONS') {
    return NextResponse.json({}, { headers: corsHeaders() });
  }

  if (req.headers.get('content-type') !== 'application/json') {
    return NextResponse.json(
      { error: 'Invalid content type. Please use application/json.' },
      { status: 400, headers: corsHeaders() }
    );
  }

  try {
    const { originalContract, instructions, role }: RevisionRequest =
      await req.json();

    if (!originalContract || !instructions || !role) {
      return NextResponse.json(
        {
          error:
            'Missing original contract, instructions, or professional role. Please provide all necessary information.',
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Optimize contract text to reduce tokens while preserving important information
    const optimizedContract = optimizeContractText(originalContract, 10000);

    const content = [
      SYSTEM_MESSAGE,
      `Original Contract: ${optimizedContract}`,
      `Revision Instructions: ${instructions}`,
      `Music Professional Role: ${role}`,
      'Please revise the contract based on the given instructions, making it more favorable for the specified music industry professional.',
    ];

    const cacheKey = JSON.stringify(content);
    const cachedResponse = cacheGet(cacheKey);
    if (cachedResponse) {
      return NextResponse.json(
        {
          revisedContract: cachedResponse,
          message: 'Contract revised successfully (from cache).',
        },
        { status: 200, headers: corsHeaders() }
      );
    }

    const startTime = Date.now();
    const revisedContract = await generateWithRetry(content);
    const processingTimeMs = Date.now() - startTime;
    cacheSet(cacheKey, revisedContract);

    // Track contract revision (non-blocking)
    fetch(`${req.nextUrl.origin}/api/track-contract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contractText: originalContract,
        revisedText: revisedContract,
        processingTimeMs,
        contractType: 'revise',
      }),
    }).catch(console.error);

    return NextResponse.json(
      { revisedContract, message: 'Contract revised successfully.' },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error: unknown) {
    const { errorMessage, statusCode } = handleError(error);
    return NextResponse.json(
      {
        error: errorMessage,
        message: 'Failed to revise contract. Please try again later.',
      },
      { status: statusCode, headers: corsHeaders() }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}
