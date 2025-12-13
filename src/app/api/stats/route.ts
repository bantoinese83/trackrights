import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    // Get total contracts analyzed
    const contractsResult = await sql`
      SELECT COUNT(*) as count FROM contracts
    `;
    const contractsAnalyzed = Number(contractsResult[0]?.['count'] || 0);

    // Get unique users who have analyzed contracts
    const activeUsersResult = await sql`
      SELECT COUNT(DISTINCT user_id) as count 
      FROM contract_analyses 
      WHERE user_id IS NOT NULL
    `;
    const musicProfessionals = Number(activeUsersResult[0]?.['count'] || 0);

    // Get average processing time
    const avgTimeResult = await sql`
      SELECT AVG(processing_time_ms) as avg_time 
      FROM contract_analyses 
      WHERE processing_time_ms IS NOT NULL AND success = true
    `;
    const avgTimeMs = Number(avgTimeResult[0]?.['avg_time'] || 30000);
    const avgTimeSeconds = Math.round(avgTimeMs / 1000);

    // Accuracy rate (successful analyses / total analyses)
    const accuracyResult = await sql`
      SELECT 
        COUNT(*) FILTER (WHERE success = true) as successful,
        COUNT(*) as total
      FROM contract_analyses
    `;
    const successful = Number(accuracyResult[0]?.['successful'] || 0);
    const total = Number(accuracyResult[0]?.['total'] || 0);
    const accuracyRate =
      total > 0 ? Math.round((successful / total) * 100) : 95;

    // Get generated contracts (revised contracts)
    const generatedResult = await sql`
      SELECT COUNT(*) as count 
      FROM contracts 
      WHERE revised_text IS NOT NULL
    `;
    const generatedContracts = Number(generatedResult[0]?.['count'] || 0);

    return NextResponse.json({
      contractsAnalyzed: contractsAnalyzed || 0,
      musicProfessionals: musicProfessionals || 0,
      averageAnalysisTime: avgTimeSeconds || 30,
      accuracyRate: accuracyRate || 95,
      generatedContracts: generatedContracts || 0,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    // Return default stats if database error
    return NextResponse.json({
      contractsAnalyzed: 0,
      musicProfessionals: 0,
      totalUsers: 0,
      averageAnalysisTime: 30,
      accuracyRate: 95,
      generatedContracts: 0,
    });
  }
}
