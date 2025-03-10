import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { corsHeaders, getApiKey, handleError } from '../utils';

const apiKey = getApiKey();
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
  model: 'models/gemini-2.0-flash-exp',
});

const SYSTEM_MESSAGE = `You are an expert seasoned music industry lawyer specialized in revising music industry contracts in favor of various music professionals, including artists, producers, performers, songwriters, and managers. Your task is to rewrite the given contract based on the provided instructions, making it more favorable for the specific music professional while still maintaining a fair and legal agreement. Follow these guidelines:

1. Carefully analyze the original contract and the revision instructions.
2. Identify key areas where the contract can be improved for the benefit of the specific music professional role.
3. Rewrite relevant clauses to align with the interests of the music professional, as per the instructions.
4. Ensure that the revised contract remains legally sound and doesn't introduce unfair or unethical terms.
5. Maintain a professional and formal tone throughout the revised contract.
6. Highlight any significant changes you've made in the revision process.
7. Consider the unique needs and concerns of different music industry roles (e.g., artists, producers, performers, songwriters, managers) when revising the contract.
8. Address specific issues related to royalties, creative control, ownership rights, and other relevant aspects for various music industry professionals.
9. Ensure that the revised contract is balanced and considers the interests of all parties involved while prioritizing the specified music professional's needs.
10. Include explanations for major changes, helping the music professional understand the improvements made.

Format your response using standard contract structure and language. Use clear and concise language that is easily understandable by both parties, regardless of their level of experience in the music industry.`;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const MAX_RETRIES = 5;
const BASE_DELAY = 1000; // 1 second

interface RevisionRequest {
  originalContract: string;
  instructions: string;
  role: string;
}

const cache = new Map<string, { value: string; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

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
    const result = await model.generateContent(content);
    const responseText = result.response.text();
    cacheSet(cacheKey, responseText);
    return responseText;
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      'status' in error &&
      (error as { status: number }).status &&
      (error.status === 429 || error.status === 503) &&
      retryCount < MAX_RETRIES
    ) {
      const waitTime = BASE_DELAY * Math.pow(2, retryCount);
      console.log(`Service unavailable. Retrying in ${waitTime}ms...`);
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

    const content = [
      SYSTEM_MESSAGE,
      `Original Contract: ${originalContract}`,
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

    const revisedContract = await generateWithRetry(content);
    cacheSet(cacheKey, revisedContract);

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
