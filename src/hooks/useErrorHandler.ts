/**
 * useErrorHandler Hook
 * Centralized error handling with user-friendly messages
 */

import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ApiError } from '@/services/api.service';

interface ErrorHandlerOptions {
  showToast?: boolean;
  logError?: boolean;
}

export function useErrorHandler(options: ErrorHandlerOptions = {}) {
  const { showToast = true, logError = true } = options;
  const { toast } = useToast();

  const handleError = useCallback(
    (error: unknown, customMessage?: string) => {
      let errorMessage = customMessage || 'An unexpected error occurred';
      let statusCode = 500;

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (isApiError(error)) {
        errorMessage = error.message;
        statusCode = error.statusCode;
      }

      if (logError) {
        console.error('Error:', error);
      }

      if (showToast) {
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }

      return { errorMessage, statusCode };
    },
    [toast, showToast, logError]
  );

  return { handleError };
}

function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    'statusCode' in error
  );
}
