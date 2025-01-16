import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

const getApiKey = (): string => {
  const envApiKey = process.env.GEMINI_API_KEY;
  if (envApiKey) {
    return envApiKey;
  }
  console.warn(
    'GEMINI_API_KEY not found in environment variables. Using fallback key.'
  );
  return '';
};

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

async function generateWithRetry(
  content: string[],
  retryCount = 0
): Promise<string> {
  try {
    const result = await model.generateContent(content);
    return result.response.text();
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

const handleError = (
  error: unknown
): { errorMessage: string; statusCode: number } => {
  console.error('Error revising music industry contract:', error);
  let errorMessage = 'Failed to revise the music industry contract';
  let statusCode = 500;

  if (error instanceof Error && (error as { status?: number }).status === 429) {
    errorMessage = 'API rate limit exceeded. Please try again later.';
    statusCode = 429;
  } else if (
    error instanceof Error &&
    (error as { status?: number }).status === 403
  ) {
    errorMessage = 'API access forbidden. Please check your API key.';
    statusCode = 403;
  } else if (
    error instanceof Error &&
    (error as { status?: number }).status === 503
  ) {
    errorMessage = 'Service unavailable. Please try again later.';
    statusCode = 503;
  }

  return { errorMessage, statusCode };
};

export async function POST(req: NextRequest) {
  if (req.method === 'OPTIONS') {
    return NextResponse.json({}, { headers: corsHeaders() });
  }

  if (req.headers.get('content-type') !== 'application/json') {
    return NextResponse.json(
      { error: 'Invalid content type' },
      { status: 400, headers: corsHeaders() }
    );
  }

  try {
    const { originalContract, instructions, role } = await req.json();

    if (!originalContract || !instructions || !role) {
      return NextResponse.json(
        {
          error:
            'Missing original contract, instructions, or professional role',
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

    const revisedContract = await generateWithRetry(content);

    return NextResponse.json(
      { revisedContract },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error: unknown) {
    const { errorMessage, statusCode } = handleError(error);
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode, headers: corsHeaders() }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}
