import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import {
  corsHeaders,
  getApiKey,
  handleError,
  cacheGet,
  cacheSet,
} from '../utils';
import { generateWithRetry } from '@/lib/ai-retry';
import { validate, generateContractRequestSchema } from '@/lib/validation';

// Set max duration for Vercel serverless function (60 seconds)
export const maxDuration = 60;

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

// Helper function to generate content with caching
async function generateContent(content: string[]): Promise<string> {
  const cacheKey = JSON.stringify(content);
  const cachedResponse = cacheGet(cacheKey);
  if (cachedResponse) {
    return cachedResponse;
  }

  const contentString = content.join('\n\n');
  const response = await generateWithRetry(ai, contentString);

  cacheSet(cacheKey, response);
  return response;
}

export async function POST(req: NextRequest) {
  if (req.method === 'OPTIONS') {
    return NextResponse.json({}, { headers: corsHeaders(req) });
  }

  try {
    if (req.headers.get('content-type') !== 'application/json') {
      return NextResponse.json(
        { error: 'Invalid content type. Please use application/json.' },
        { status: 400, headers: corsHeaders(req) }
      );
    }

    const body = await req.json();
    const validated = await validate(generateContractRequestSchema, body);
    const { contractDetails, contractInputs } = validated;

    const content = [
      SYSTEM_MESSAGE,
      `Contract Type: ${contractDetails.id}`,
      `Contract Details: ${JSON.stringify(contractDetails)}`,
      `Contract Inputs: ${JSON.stringify(contractInputs)}`,
      'Generate ONLY the complete contract text based on the provided information. Do not include any additional explanations or text outside the contract itself.',
    ];

    const generatedContract = await generateContent(content);

    return NextResponse.json(
      { generatedContract, message: 'Contract generated successfully.' },
      { status: 200, headers: corsHeaders(req) }
    );
  } catch (error: unknown) {
    return handleError(error, req);
  }
}

export async function OPTIONS(req: NextRequest) {
  return NextResponse.json({}, { headers: corsHeaders(req) });
}
