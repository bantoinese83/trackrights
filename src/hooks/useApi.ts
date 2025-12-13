/**
 * useApi Hook
 * Generic hook for API calls with loading, error, and retry logic
 */

import { useState, useCallback, useRef } from 'react';
import type { ApiError } from '@/services/api.service';

interface UseApiOptions {
  retries?: number;
  retryDelay?: number;
  onSuccess?: (data: unknown) => void;
  onError?: (error: ApiError) => void;
}

interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  execute: (...args: unknown[]) => Promise<T | null>;
  reset: () => void;
}

export function useApi<T>(
  apiCall: (...args: unknown[]) => Promise<T>,
  options: UseApiOptions = {}
): UseApiReturn<T> {
  const { retries = 3, retryDelay = 1000, onSuccess, onError } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const retryCountRef = useRef(0);

  const execute = useCallback(
    async (...args: unknown[]): Promise<T | null> => {
      setLoading(true);
      setError(null);
      retryCountRef.current = 0;

      const attempt = async (): Promise<T | null> => {
        try {
          const result = await apiCall(...args);
          setData(result);
          onSuccess?.(result);
          return result;
        } catch (err) {
          const apiError = err as ApiError;

          if (
            retryCountRef.current < retries &&
            (apiError.statusCode === 429 || apiError.statusCode === 503)
          ) {
            retryCountRef.current += 1;
            const delay = retryDelay * Math.pow(2, retryCountRef.current - 1);
            await new Promise((resolve) => setTimeout(resolve, delay));
            return attempt();
          }

          setError(apiError);
          onError?.(apiError);
          throw apiError;
        } finally {
          setLoading(false);
        }
      };

      return attempt();
    },
    [apiCall, retries, retryDelay, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
    retryCountRef.current = 0;
  }, []);

  return { data, loading, error, execute, reset };
}
