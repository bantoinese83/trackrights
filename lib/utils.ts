import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function handleError(error: unknown): { errorMessage: string; statusCode: number } {
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

export function logInfo(message: string) {
  console.info(`Info: ${message}`);
}

export function logWarning(message: string) {
  console.warn(`Warning: ${message}`);
}

export function logError(message: string) {
  console.error(`Error: ${message}`);
}
