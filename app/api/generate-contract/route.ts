import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { corsHeaders, getApiKey, handleError } from '../utils';

const apiKey = getApiKey();
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
  model: 'models/gemini-2.0-flash-exp',
});

const SYSTEM_MESSAGE = `You are an AI specialized in generating music industry contracts. Your task is to create a complete, professional contract based on the provided details and contract type. Follow these guidelines:

1. Generate ONLY the contract text. Do not include any explanations, metadata, or additional text outside the contract itself.
2. Begin the contract with a clear title and introduction defining the parties and effective date.
3. Use proper legal formatting with numbered clauses and sub-clauses.
4. Include all necessary components based on the contract type (e.g., scope of work, payment terms, ownership rights, termination clauses).
5. Customize the contract using the provided inputs and details.
6. Use clear, concise language appropriate for legal documents.
7. End the contract with signature blocks for all relevant parties.
8. Do not include any text or formatting that is not part of the actual contract.`;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const MAX_RETRIES = 5;
const BASE_DELAY = 1000; // 1 second

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

async function generateWithRetry(
  content: Content[],
  retryCount = 0
): Promise<string> {
  try {
    const result = await model.generateContent(content);
    return result.response.text();
  } catch (error: unknown) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'status' in error &&
      (error.status === 429 || error.status === 503) &&
      retryCount < MAX_RETRIES
    ) {
      const waitTime = BASE_DELAY * Math.pow(2, retryCount);
      console.log(`Service unavailable. Retrying in ${waitTime}ms...`);
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
        { error: 'Invalid content type' },
        { status: 400, headers: corsHeaders() }
      );
    }

    const { contractDetails, contractInputs }: { contractDetails: ContractDetails; contractInputs: ContractInputs } = await req.json();

    if (!contractDetails || !contractInputs) {
      return NextResponse.json(
        { error: 'Missing contract details or inputs' },
        { status: 400, headers: corsHeaders() }
      );
    }

    const content: Content[] = [
      { text: SYSTEM_MESSAGE },
      { text: `Contract Type: ${contractDetails.id}` },
      { text: `Contract Details: ${JSON.stringify(contractDetails)}` },
      { text: `Contract Inputs: ${JSON.stringify(contractInputs)}` },
      { text: 'Generate ONLY the complete contract text based on the provided information. Do not include any additional explanations or text outside the contract itself.' },
    ];

    const generatedContract = await generateWithRetry(content);

    return NextResponse.json(
      { generatedContract },
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
