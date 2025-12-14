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

/**
 * Generate content with retry logic
 */
export async function generateWithRetry(
  ai: GoogleGenAI,
  content: Content[] | string[] | string,
  options: RetryOptions = {}
): Promise<string> {
  const {
    maxRetries = 5,
    timeoutMs = 50000,
    model = 'gemini-2.5-pro',
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
      // Rate limit check before making request
      await rateLimiter.waitIfNeeded();

      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(
          () =>
            reject(new TimeoutError(`Request timeout after ${timeoutMs}ms`)),
          timeoutMs
        );
      });

      // Make API call with timeout
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
      // Don't retry daily quota errors
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

      // Check if it's a retryable error
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

      // Calculate retry delay
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

  // This should never be reached, but TypeScript needs it
  throw new ExternalServiceError(
    'Failed to generate content after all retries',
    'gemini'
  );
}
