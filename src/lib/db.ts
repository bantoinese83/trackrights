import { neon } from '@neondatabase/serverless';

// Initialize with empty string during build - will be replaced at runtime
// This prevents build failures when DATABASE_URL is not available
const databaseUrl = process.env['DATABASE_URL'] || '';
const sql = neon(databaseUrl || 'postgresql://');

export { sql };
