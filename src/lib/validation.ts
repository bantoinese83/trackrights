/**
 * Runtime Validation Schemas using Zod
 * Provides type-safe validation for API requests
 */

import { z } from 'zod';
import { ValidationError } from './errors';

/**
 * Validate data against a schema and throw ValidationError if invalid
 */
export async function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): Promise<T> {
  try {
    return await schema.parseAsync(data);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const details = error.issues.map((err: z.ZodIssue) => ({
        path: err.path.join('.'),
        message: err.message,
      }));
      throw new ValidationError(
        `Validation failed: ${details.map((d: { path: string; message: string }) => d.message).join(', ')}`,
        details
      );
    }
    throw error;
  }
}

/**
 * File upload validation schema
 */
export const fileUploadSchema = z
  .object({
    file: z.instanceof(File, { message: 'File is required' }),
  })
  .refine((data) => data.file.size <= 10 * 1024 * 1024, {
    message: 'File size must be less than 10MB',
  })
  .refine(
    (data) => ['application/pdf', 'text/plain'].includes(data.file.type),
    { message: 'File must be PDF or TXT' }
  );

/**
 * Contract text validation schema
 */
export const contractTextSchema = z.object({
  contractText: z
    .string()
    .min(10, 'Contract text must be at least 10 characters')
    .max(1000000, 'Contract text is too long'),
});

/**
 * Simplify contract request schema
 */
export const simplifyContractRequestSchema = z.object({
  contractText: z.string().min(10).max(1000000),
});

/**
 * Revise contract request schema
 */
export const reviseContractRequestSchema = z.object({
  originalContract: z.string().min(10).max(1000000),
  instructions: z.string().min(1, 'Instructions are required').max(5000),
  role: z.string().min(1, 'Role is required').max(100),
});

/**
 * Generate contract request schema
 */
export const generateContractRequestSchema = z.object({
  contractDetails: z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    description: z.string().min(1),
    fields: z.record(
      z.string(),
      z.object({
        label: z.string(),
        type: z.string(),
      })
    ),
  }),
  contractInputs: z.record(z.string(), z.union([z.string(), z.number()])),
});

/**
 * Stats response schema
 */
export const statsResponseSchema = z.object({
  contractsAnalyzed: z.number().int().min(0),
  musicProfessionals: z.number().int().min(0),
  averageAnalysisTime: z.number().int().min(0),
  accuracyRate: z.number().int().min(0).max(100),
  generatedContracts: z.number().int().min(0),
});

export type StatsResponse = z.infer<typeof statsResponseSchema>;
