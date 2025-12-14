import { type NextRequest, NextResponse } from 'next/server';
import { AppError, toErrorResponse, logError, isAppError } from '@/lib/errors';
import { cacheGet, cacheSet } from '@/lib/cache';

export function corsHeaders(req?: NextRequest): Record<string, string> {
  // Get allowed origins from environment or use defaults
  const allowedOrigins = process.env['ALLOWED_ORIGINS']?.split(',') || [
    'https://trackrights.com',
    'https://www.trackrights.com',
  ];

  // In development, allow localhost
  if (process.env.NODE_ENV === 'development') {
    allowedOrigins.push('http://localhost:3000');
  }

  // Get the origin from the request
  const origin = req?.headers.get('origin');

  // Determine which origin to allow
  const allowedOrigin =
    origin && allowedOrigins.includes(origin)
      ? origin
      : allowedOrigins[0] || '*';

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400', // 24 hours
  };
}

export function getApiKey(): string {
  const envApiKey = process.env['GEMINI_API_KEY'];
  if (!envApiKey || envApiKey.trim() === '') {
    throw new AppError(
      'GEMINI_API_KEY is not configured. Please set it in environment variables.',
      500,
      'MISSING_API_KEY'
    );
  }
  return envApiKey;
}

/**
 * Standardized error handler for API routes
 * Converts errors to standardized error responses
 */
export function handleError(error: unknown, req?: NextRequest): NextResponse {
  logError(error, {
    path: req?.nextUrl?.pathname,
    method: req?.method,
  });

  const errorResponse = toErrorResponse(error);
  const statusCode = isAppError(error) ? error.statusCode : 500;

  return NextResponse.json(errorResponse, {
    status: statusCode,
    headers: corsHeaders(req),
  });
}

/**
 * Re-export cache functions for backward compatibility
 */
export { cacheGet, cacheSet };
