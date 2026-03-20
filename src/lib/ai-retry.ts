/**
 * Shared AI API Retry Logic
 * Handles retries for Gemini API calls with proper error handling
 */

import { GoogleGenAI } from '@google/genai';
import { rateLimiter, calculateRetryDelay } from '@/lib/utils/rate-limiter';
import {
  RateLimitError,
  TimeoutError,
  ExternalServiceError,
  logError,
} from '@/lib/errors';

interface RetryOptions {
  maxRetries?: number;
  timeoutMs?: number;
  model?: string;
}

interface Content {
  text?: string;
  inlineData?: {
    data: string;
    mimeType: string;
  };
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Check if error is a daily quota error (should not retry)
 */
function isDailyQuotaError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) {
    return false;
  }

  const errorStatus = (error as { status?: number })?.status;
  if (errorStatus !== 429) {
    return false;
  }

  const errorString = JSON.stringify(error);
  return (
    errorString.includes('GenerateRequestsPerDayPerProjectPerModel') ||
    errorString.includes('free_tier_requests') ||
    errorString.includes('quotaValue')
  );
}

function getHttpStatus(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null) {
    return undefined;
  }
  const e = error as Record<string, unknown>;
  if (typeof e['status'] === 'number') {
    return e['status'];
  }
  const cause = e['cause'];
  if (
    cause &&
    typeof cause === 'object' &&
    cause !== null &&
    'status' in cause
  ) {
    const s = (cause as { status?: unknown }).status;
    return typeof s === 'number' ? s : undefined;
  }
  return undefined;
}

/**
 * Whether to try the next configured API key (different project / quota).
 */
export function shouldRotateGeminiKey(error: unknown): boolean {
  if (error instanceof TimeoutError) {
    return false;
  }
  if (error instanceof RateLimitError) {
    return true;
  }

  const status = getHttpStatus(error);
  if (status === 401 || status === 403) {
    return true;
  }
  if (status === 429) {
    return true;
  }
  if (status === 503) {
    return true;
  }
  if (status === 400) {
    const s = JSON.stringify(error);
    if (
      /API[_ ]?key|PERMISSION_DENIED|INVALID_ARGUMENT|API_KEY_INVALID/i.test(s)
    ) {
      return true;
    }
  }

  if (error instanceof ExternalServiceError && error.originalError) {
    return shouldRotateGeminiKey(error.originalError);
  }

  return false;
}

async function generateWithRetrySingleClient(
  ai: GoogleGenAI,
  content: Content[] | string[] | string,
  options: RetryOptions = {}
): Promise<string> {
  const {
    maxRetries = 5,
    timeoutMs = 50000,
    model = 'gemini-2.5-flash-lite',
  } = options;

  let contentString: string;
  if (typeof content === 'string') {
    contentString = content;
  } else if (Array.isArray(content)) {
    contentString = content
      .map((item) => (typeof item === 'string' ? item : item.text || ''))
      .filter(Boolean)
      .join('\n\n');
  } else {
    contentString = '';
  }

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      await rateLimiter.waitIfNeeded();

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(
          () =>
            reject(new TimeoutError(`Request timeout after ${timeoutMs}ms`)),
          timeoutMs
        );
      });

      const result = await Promise.race([
        ai.models.generateContent({
          model,
          contents: contentString,
        }),
        timeoutPromise,
      ]);

      const responseText = result.text ?? '';
      if (!responseText) {
        throw new ExternalServiceError(
          'No response text received from API',
          'gemini'
        );
      }

      return responseText;
    } catch (error: unknown) {
      if (isDailyQuotaError(error)) {
        logError(error, {
          attempt,
          maxRetries,
          contentLength: contentString.length,
        });
        throw new RateLimitError(
          'Daily API quota exceeded. Please try again tomorrow or upgrade your plan.'
        );
      }

      const errorStatus = (error as { status?: number })?.status;
      const isRetryable =
        errorStatus === 429 ||
        errorStatus === 503 ||
        error instanceof TimeoutError;

      if (!isRetryable || attempt >= maxRetries) {
        logError(error, {
          attempt,
          maxRetries,
          contentLength: contentString.length,
        });

        if (error instanceof TimeoutError) {
          throw error;
        }

        if (errorStatus === 429) {
          throw new RateLimitError(
            'API rate limit exceeded. Please wait a moment and try again.'
          );
        }

        throw new ExternalServiceError(
          'Failed to generate content from AI service',
          'gemini',
          error
        );
      }

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
        waitTime = calculateRetryDelay(attempt, retryInfo?.retryDelay);
      } catch {
        waitTime = calculateRetryDelay(attempt);
      }

      logError(error, {
        attempt: attempt + 1,
        maxRetries,
        waitTime,
        willRetry: true,
      });

      console.log(
        `Rate limit or service unavailable. Retrying in ${Math.ceil(waitTime / 1000)}s... (Attempt ${attempt + 1}/${maxRetries})`
      );

      await delay(waitTime);
    }
  }

  throw new ExternalServiceError(
    'Failed to generate content after all retries',
    'gemini'
  );
}

export async function generateWithRetry(
  ai: GoogleGenAI,
  content: Content[] | string[] | string,
  options?: RetryOptions
): Promise<string>;
export async function generateWithRetry(
  apiKeys: string[],
  content: Content[] | string[] | string,
  options?: RetryOptions
): Promise<string>;
export async function generateWithRetry(
  aiOrKeys: GoogleGenAI | string[],
  content: Content[] | string[] | string,
  options: RetryOptions = {}
): Promise<string> {
  if (Array.isArray(aiOrKeys)) {
    const keys = aiOrKeys.map((k) => k.trim()).filter(Boolean);
    if (keys.length === 0) {
      throw new ExternalServiceError('No Gemini API keys configured', 'gemini');
    }

    let lastError: unknown;
    for (let i = 0; i < keys.length; i++) {
      const ai = new GoogleGenAI({ apiKey: keys[i] });
      try {
        return await generateWithRetrySingleClient(ai, content, options);
      } catch (error) {
        lastError = error;
        const hasNext = i < keys.length - 1;
        if (hasNext && shouldRotateGeminiKey(error)) {
          logError(error, {
            geminiKeyFallback: true,
            keyIndex: i,
            message: 'Retrying with fallback Gemini API key',
          });
          continue;
        }
        throw error;
      }
    }
    throw lastError;
  }

  return generateWithRetrySingleClient(aiOrKeys, content, options);
}
