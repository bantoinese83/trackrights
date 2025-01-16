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

const SYSTEM_MESSAGE = `You are an AI assistant specialized in analyzing and simplifying music industry contracts. Your task is to provide a comprehensive analysis of the given contract text for various music industry professionals, including but not limited to artists, producers, performers, songwriters, and managers.`;

const MAX_EXECUTION_TIME = 50000; // 50 seconds
const MAX_RETRIES = 3;
const BASE_DELAY = 1000; // 1 second

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function generateWithRetry(
  content: string[],
  retryCount = 0
): Promise<string> {
  try {
    const result = await model.generateContent(content);
    return result.response.text();
  } catch (error: unknown) {
    if (retryCount < MAX_RETRIES) {
      const waitTime = BASE_DELAY * Math.pow(2, retryCount);
      console.log(`Error occurred. Retrying in ${waitTime}ms...`);
      await delay(waitTime);
      return generateWithRetry(content, retryCount + 1);
    }
    throw error;
  }
}

const handleError = (
  error: unknown
): { errorMessage: string; statusCode: number } => {
  console.error('Error processing music industry contract:', error);
  let errorMessage = 'Failed to process the music industry contract';
  let statusCode = 500;

  if (error instanceof Error) {
    if ((error as { status?: number }).status === 429) {
      errorMessage = 'API rate limit exceeded. Please try again later.';
      statusCode = 429;
    } else if ((error as { status?: number }).status === 403) {
      errorMessage = 'API access forbidden. Please check your API key.';
      statusCode = 403;
    } else if ((error as { status?: number }).status === 503) {
      errorMessage = 'Service unavailable. Please try again later.';
      statusCode = 503;
    } else {
      errorMessage = error.message;
    }
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

  const executionStart = Date.now();

  try {
    const { contractText } = await req.json();

    if (!contractText) {
      return NextResponse.json(
        { error: 'Missing contract text' },
        { status: 400, headers: corsHeaders() }
      );
    }

    const content = [
      SYSTEM_MESSAGE,
      contractText,
      'Simplify this contract based on the instructions provided, and format the response using Markdown as specified.',
    ];

    const simplificationPromise = generateWithRetry(content);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(
        () => reject(new Error('Function execution timed out')),
        MAX_EXECUTION_TIME
      );
    });

    const simplifiedContract = (await Promise.race([
      simplificationPromise,
      timeoutPromise,
    ])) as string;

    const executionTime = Date.now() - executionStart;
    console.log(`Contract simplification completed in ${executionTime}ms`);

    return NextResponse.json(
      { simplifiedContract },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error: unknown) {
    const { errorMessage, statusCode } = handleError(error);
    const executionTime = Date.now() - executionStart;
    console.error(`Error occurred after ${executionTime}ms:`, errorMessage);
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode, headers: corsHeaders() }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}
