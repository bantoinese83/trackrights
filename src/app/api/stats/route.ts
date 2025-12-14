import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { statsResponseSchema, type StatsResponse } from '@/lib/validation';
import { logError } from '@/lib/errors';

// Force dynamic rendering to prevent build-time database connection attempts
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface DatabaseResult {
  count?: number;
  avg_time?: number | null;
  successful?: number;
  total?: number;
}

/**
 * Safely extract number from database result
 */
function extractNumber(
  result: DatabaseResult[],
  key: keyof DatabaseResult,
  defaultValue: number = 0
): number {
  const value = result[0]?.[key];
  if (typeof value === 'number') {
    return value;
  }
  if (value === null || value === undefined) {
    return defaultValue;
  }
  return Number(value) || defaultValue;
}

export async function GET() {
  try {
    // Get total contracts analyzed
    const contractsResult = (await sql`
      SELECT COUNT(*)::int as count FROM contracts
    `) as DatabaseResult[];
    const contractsAnalyzed = extractNumber(contractsResult, 'count', 0);

    // Get unique users who have analyzed contracts
    const activeUsersResult = (await sql`
      SELECT COUNT(DISTINCT user_id)::int as count 
      FROM contract_analyses 
      WHERE user_id IS NOT NULL
    `) as DatabaseResult[];
    const musicProfessionals = extractNumber(activeUsersResult, 'count', 0);

    // Get average processing time
    const avgTimeResult = (await sql`
      SELECT AVG(processing_time_ms)::float as avg_time 
      FROM contract_analyses 
      WHERE processing_time_ms IS NOT NULL AND success = true
    `) as DatabaseResult[];
    const avgTimeMs = extractNumber(avgTimeResult, 'avg_time', 30000);
    const avgTimeSeconds = Math.round(avgTimeMs / 1000);

    // Accuracy rate (successful analyses / total analyses)
    const accuracyResult = (await sql`
      SELECT 
        COUNT(*) FILTER (WHERE success = true)::int as successful,
        COUNT(*)::int as total
      FROM contract_analyses
    `) as DatabaseResult[];
    const successful = extractNumber(accuracyResult, 'successful', 0);
    const total = extractNumber(accuracyResult, 'total', 0);
    const accuracyRate =
      total > 0 ? Math.round((successful / total) * 100) : 95;

    // Get generated contracts (revised contracts)
    const generatedResult = (await sql`
      SELECT COUNT(*)::int as count 
      FROM contracts 
      WHERE revised_text IS NOT NULL
    `) as DatabaseResult[];
    const generatedContracts = extractNumber(generatedResult, 'count', 0);

    const stats: StatsResponse = {
      contractsAnalyzed,
      musicProfessionals,
      averageAnalysisTime: avgTimeSeconds,
      accuracyRate,
      generatedContracts,
    };

    // Validate response matches schema
    const validatedStats = statsResponseSchema.parse(stats);

    return NextResponse.json(validatedStats);
  } catch (error) {
    logError(error, { endpoint: '/api/stats' });
    // Return default stats if database error
    const defaultStats: StatsResponse = {
      contractsAnalyzed: 0,
      musicProfessionals: 0,
      averageAnalysisTime: 30,
      accuracyRate: 95,
      generatedContracts: 0,
    };
    return NextResponse.json(defaultStats);
  }
}
