/**
 * Custom Error Classes and Error Handling Utilities
 * Provides standardized error handling across the application
 */

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded', retryAfter?: number) {
    super(message, 429, 'RATE_LIMIT_ERROR', { retryAfter });
    this.name = 'RateLimitError';
  }
}

export class ExternalServiceError extends AppError {
  constructor(
    message: string,
    public service: string,
    public originalError?: unknown
  ) {
    super(message, 502, 'EXTERNAL_SERVICE_ERROR', { service, originalError });
    this.name = 'ExternalServiceError';
  }
}

export class TimeoutError extends AppError {
  constructor(message: string = 'Request timeout') {
    super(message, 504, 'TIMEOUT_ERROR');
    this.name = 'TimeoutError';
  }
}

/**
 * Type guard to check if error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return (
    error instanceof AppError ||
    (typeof error === 'object' &&
      error !== null &&
      'statusCode' in error &&
      'code' in error)
  );
}

/**
 * Standardized error response format
 */
export interface ErrorResponse {
  error: {
    message: string;
    code?: string;
    statusCode: number;
    details?: unknown;
    timestamp: string;
  };
}

/**
 * Convert any error to a standardized error response
 */
export function toErrorResponse(error: unknown): ErrorResponse {
  if (isAppError(error)) {
    const response: ErrorResponse = {
      error: {
        message: error.message,
        statusCode: error.statusCode,
        timestamp: new Date().toISOString(),
      },
    };

    if (error.code !== undefined) {
      response.error.code = error.code;
    }

    if (error.details !== undefined) {
      response.error.details = error.details;
    }

    return response;
  }

  if (error instanceof Error) {
    return {
      error: {
        message: error.message,
        statusCode: 500,
        timestamp: new Date().toISOString(),
      },
    };
  }

  return {
    error: {
      message: 'An unknown error occurred',
      statusCode: 500,
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Log error with context
 */
export function logError(
  error: unknown,
  context?: Record<string, unknown>
): void {
  const errorInfo = isAppError(error)
    ? {
        name: error.name,
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        details: error.details,
        stack: error.stack,
      }
    : error instanceof Error
      ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        }
      : { error };

  console.error('Error occurred:', {
    ...errorInfo,
    context,
    timestamp: new Date().toISOString(),
  });

  // TODO: Integrate with error tracking service (e.g., Sentry)
  // if (process.env.NODE_ENV === 'production') {
  //   Sentry.captureException(error, { extra: context });
  // }
}
