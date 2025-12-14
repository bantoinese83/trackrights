import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import {
  corsHeaders,
  getApiKey,
  handleError,
  cacheGet,
  cacheSet,
} from '../utils';
import { optimizeContractText } from '@/lib/utils/contract-optimizer';
import { generateWithRetry } from '@/lib/ai-retry';
import { validate, reviseContractRequestSchema } from '@/lib/validation';

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

  if (req.headers.get('content-type') !== 'application/json') {
    return NextResponse.json(
      { error: 'Invalid content type. Please use application/json.' },
      { status: 400, headers: corsHeaders(req) }
    );
  }

  try {
    const body = await req.json();
    const validated = await validate(reviseContractRequestSchema, body);
    const { originalContract, instructions, role } = validated;

    // Optimize contract text to reduce tokens while preserving important information
    const optimizedContract = optimizeContractText(originalContract, 10000);

    const content = [
      SYSTEM_MESSAGE,
      `Original Contract: ${optimizedContract}`,
      `Revision Instructions: ${instructions}`,
      `Music Professional Role: ${role}`,
      'Please revise the contract based on the given instructions, making it more favorable for the specified music industry professional.',
    ];

    const startTime = Date.now();
    const revisedContract = await generateContent(content);
    const processingTimeMs = Date.now() - startTime;

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
      { status: 200, headers: corsHeaders(req) }
    );
  } catch (error: unknown) {
    return handleError(error, req);
  }
}

export async function OPTIONS(req: NextRequest) {
  return NextResponse.json({}, { headers: corsHeaders(req) });
}
