import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

const databaseUrl = process.env['DATABASE_URL']?.trim();

/** True when a Neon connection string is set (required for real DB queries). */
export const isDatabaseConfigured = Boolean(databaseUrl);

type AppSql = NeonQueryFunction<false, false>;

/**
 * No-op SQL tag when DATABASE_URL is missing — rejects if invoked.
 * Avoids pointing the Neon HTTP driver at a fake localhost URL (which causes fetch failures).
 */
function createUnconfiguredSql(): AppSql {
  return ((_strings: TemplateStringsArray, ..._values: unknown[]) =>
    Promise.reject(new Error('DATABASE_URL is not configured'))) as AppSql;
}

export const sql: AppSql = databaseUrl
  ? neon(databaseUrl)
  : createUnconfiguredSql();
