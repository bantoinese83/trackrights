const cache = new Map<string, { value: string; timestamp: number }>();
// Extended cache TTL to 24 hours for better performance and reduced API calls
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export function getApiKey(): string {
  const envApiKey = process.env['GEMINI_API_KEY'];
  if (envApiKey) {
    return envApiKey;
  }
  console.warn(
    'GEMINI_API_KEY not found in environment variables. Using fallback key.'
  );
  return '';
}

export function handleError(error: unknown): {
  errorMessage: string;
  statusCode: number;
} {
  console.error('Error:', error);
  let errorMessage = 'An unknown error occurred';
  let statusCode = 500;

  if (error instanceof Error) {
    const errorStatus = (error as { status?: number })?.status;
    const errorMsgLower = error.message.toLowerCase();
    
    // Handle timeout errors
    if (errorMsgLower.includes('timeout') || errorStatus === 504) {
      errorMessage = 'Request timed out. The contract is too large or the service is busy. Please try again or use a shorter contract.';
      statusCode = 504;
    } else if (errorStatus === 429) {
      // Check if it's a daily quota limit or rate limit
      const errorString = JSON.stringify(error);
      const isDailyQuota = 
        errorString.includes('GenerateRequestsPerDayPerProjectPerModel') ||
        errorString.includes('free_tier_requests') ||
        errorString.includes('quotaValue');
      
      if (isDailyQuota) {
        errorMessage = 'Daily API quota exceeded (20 requests/day on free tier). The quota resets daily. Please try again tomorrow or upgrade your plan.';
      } else {
        errorMessage = 'API rate limit exceeded. Please wait a moment and try again.';
      }
      statusCode = 429;
    } else if (errorStatus === 403) {
      errorMessage = 'API access forbidden. Please check your API key.';
      statusCode = 403;
    } else if (errorStatus === 503) {
      errorMessage = 'Service unavailable. Please try again later.';
      statusCode = 503;
    } else {
      errorMessage = error.message;
    }
  }

  return { errorMessage, statusCode };
}

export function cacheGet(key: string): string | null {
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

export function cacheSet(key: string, value: string): void {
  cache.set(key, { value, timestamp: Date.now() });
}
