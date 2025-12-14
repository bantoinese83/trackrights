import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import {
  corsHeaders,
  getApiKey,
  handleError,
  cacheGet,
  cacheSet,
} from '../utils';
import {
  hashContract,
  optimizeContractText,
} from '@/lib/utils/contract-optimizer';
import { rateLimiter, calculateRetryDelay } from '@/lib/utils/rate-limiter';

// Set max duration for Vercel serverless function (30 seconds)
export const maxDuration = 30;

const apiKey = getApiKey();
const ai = new GoogleGenAI({ apiKey });

const SYSTEM_MESSAGE = `You are an expert music industry lawyer. Your task is to analyze a music contract and generate 4-5 specific, actionable example instructions that would help improve the contract for the music professional.

Analyze the contract and identify:
1. Specific financial terms (royalties, advances, percentages) that could be improved
2. Rights and control issues (creative control, ownership, exclusivity)
3. Contract duration and renewal terms
4. Any restrictive or unfavorable clauses

For each example, provide a concrete, actionable instruction in the format: "Increase my royalty percentage from X% to Y%" or "Add a clause giving me creative control over my music" or "Remove the exclusivity clause".

Return ONLY a JSON array of strings, each string being one example instruction. Do not include any other text, explanations, or formatting. Example format:
["Increase my royalty percentage from 15% to 25%", "Add a clause giving me creative control over my music", "Extend the contract term to 3 years with option to renew", "Remove the exclusivity clause"]

Make sure each instruction is:
- Specific and actionable
- Based on actual terms found in the contract
- Realistic and beneficial for the music professional
- Written in first person (e.g., "Increase my..." not "Increase the...")`;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Adjusted for free tier: 60 requests/minute
async function generateWithRetry(
  contractText: string,
  maxRetries = 5
): Promise<string[]> {
  // Use hash for cache key to save memory
  const contractHash = hashContract(contractText);
  const cacheKey = `examples:${contractHash}`;

  // Check cache first
  const cached = cacheGet(cacheKey);
  if (cached) {
    try {
      const examples = JSON.parse(cached) as string[];
      if (Array.isArray(examples) && examples.length > 0) {
        return examples;
      }
    } catch {
      // Invalid cache, continue to generate
    }
  }

  // Optimize contract text to reduce tokens
  const optimizedContract = optimizeContractText(contractText, 6000);

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Rate limit check before making request
      await rateLimiter.waitIfNeeded();

      const contents = [
        SYSTEM_MESSAGE,
        `Contract to analyze:\n${optimizedContract}`,
        'Generate 4-5 example revision instructions based on this contract. Return only a JSON array of strings.',
      ].join('\n\n');

      const result = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents,
      });

      const text = result.text ?? '';

      // Try to parse JSON from the response
      // Sometimes the AI wraps it in markdown code blocks
      let jsonText = text.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const examples = JSON.parse(jsonText) as string[];

      // Validate it's an array of strings
      if (
        Array.isArray(examples) &&
        examples.every((item) => typeof item === 'string')
      ) {
        const finalExamples = examples.slice(0, 5);
        // Cache the result
        cacheSet(cacheKey, JSON.stringify(finalExamples));
        return finalExamples;
      }

      throw new Error('Invalid response format');
    } catch (error) {
      // Check if it's a daily quota error (don't retry, quota won't reset until tomorrow)
      const errorStatus = (error as { status?: number })?.status;
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

      if (attempt === maxRetries) {
        throw error;
      }
      // Calculate retry delay based on rate limits
      const waitTime = calculateRetryDelay(attempt - 1);
      console.log(
        `Error on attempt ${attempt}. Retrying in ${Math.ceil(waitTime / 1000)}s... (${attempt}/${maxRetries})`
      );
      await delay(waitTime);
    }
  }

  // Fallback examples if all retries fail
  return [
    'Increase my royalty percentage from 15% to 25%',
    'Add a clause giving me creative control over my music',
    'Extend the contract term to 3 years with option to renew',
    'Remove the exclusivity clause',
  ];
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
    const { contractText }: { contractText: string } = await req.json();

    if (!contractText || !contractText.trim()) {
      return NextResponse.json(
        { error: 'Contract text is required.' },
        { status: 400, headers: corsHeaders(req) }
      );
    }

    // Contract text is optimized inside generateWithRetry
    const examples = await generateWithRetry(contractText);

    return NextResponse.json(
      { examples },
      { status: 200, headers: corsHeaders(req) }
    );
  } catch (error) {
    return handleError(error, req);
  }
}
