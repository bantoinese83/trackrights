import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env['DATABASE_URL'] || '';
const sql = neon(databaseUrl);

export { sql };
