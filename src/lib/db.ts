import { neon } from '@neondatabase/serverless';

// Initialize sql connection
// Use a valid placeholder URL during build to prevent neon() from throwing
// The actual connection will be established at runtime when DATABASE_URL is available
const databaseUrl = process.env['DATABASE_URL'] || 'postgresql://placeholder@localhost/placeholder';

// Initialize with the URL (or placeholder during build)
// This prevents the "not a valid URL" error during build
const sql = neon(databaseUrl);

export { sql };
