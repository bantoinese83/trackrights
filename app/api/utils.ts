const cache = new Map<string, { value: string; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export function getApiKey(): string {
  const envApiKey = process.env.GEMINI_API_KEY;
  if (envApiKey) {
    return envApiKey;
  }
  console.warn(
    'GEMINI_API_KEY not found in environment variables. Using fallback key.'
  );
  return '';
}

export function handleError(
  error: unknown
): { errorMessage: string; statusCode: number } {
  console.error('Error:', error);
  let errorMessage = 'An unknown error occurred';
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
