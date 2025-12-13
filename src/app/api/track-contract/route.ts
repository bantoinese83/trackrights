import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const {
      contractText,
      simplifiedText,
      revisedText,
      processingTimeMs,
      contractType = 'simplify',
    } = await req.json();

    if (!contractText) {
      return NextResponse.json(
        { error: 'Contract text required' },
        { status: 400 }
      );
    }

    // Get or create session ID
    const cookieStore = await cookies();
    let sessionId = cookieStore.get('session_id')?.value;

    if (!sessionId) {
      sessionId = crypto.randomUUID();
      cookieStore.set('session_id', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365, // 1 year
      });
    }

    // Get or create user
    const userResult = await sql`
      SELECT id FROM users WHERE session_id = ${sessionId}
    `;

    let userId: string | null = null;
    if (userResult.length > 0 && userResult[0]) {
      userId = userResult[0]['id'] as string;
      // Update last active
      await sql`
        UPDATE users 
        SET last_active_at = NOW(), total_contracts = total_contracts + 1
        WHERE id = ${userId}
      `;
    } else {
      // Create new user
      const newUser = await sql`
        INSERT INTO users (session_id, first_contract_at, last_active_at, total_contracts)
        VALUES (${sessionId}, NOW(), NOW(), 1)
        RETURNING id
      `;
      userId = (newUser[0]?.['id'] as string) || null;
    }

    if (contractType === 'revise' && revisedText) {
      // For revisions, find existing contract and update it
      const existingContract = await sql`
        SELECT id FROM contracts 
        WHERE original_text = ${contractText} 
        ORDER BY created_at DESC 
        LIMIT 1
      `;

      if (existingContract.length > 0 && existingContract[0]) {
        const contractId = (existingContract[0]?.['id'] as string) || null;
        if (!contractId) {
          return NextResponse.json(
            { error: 'Contract ID not found' },
            { status: 500 }
          );
        }
        // Update existing contract with revised text
        await sql`
          UPDATE contracts 
          SET revised_text = ${revisedText}, 
              processing_time_ms = ${processingTimeMs || null},
              updated_at = NOW()
          WHERE id = ${contractId}
        `;
        // Create analysis record for revision
        await sql`
          INSERT INTO contract_analyses (contract_id, user_id, analysis_type, started_at, completed_at, processing_time_ms, success)
          VALUES (${contractId}, ${userId}, ${contractType}, NOW(), NOW(), ${processingTimeMs || null}, true)
        `;
        return NextResponse.json({ success: true, contractId });
      }
    }

    // Create new contract record
    const contractResult = await sql`
      INSERT INTO contracts (original_text, simplified_text, revised_text, contract_type, processing_time_ms)
      VALUES (${contractText}, ${simplifiedText || null}, ${revisedText || null}, ${contractType}, ${processingTimeMs || null})
      RETURNING id
    `;
    const contractId = (contractResult[0]?.['id'] as string) || null;

    if (contractId) {
      // Create analysis record
      await sql`
        INSERT INTO contract_analyses (contract_id, user_id, analysis_type, started_at, completed_at, processing_time_ms, success)
        VALUES (${contractId}, ${userId}, ${contractType}, NOW(), NOW(), ${processingTimeMs || null}, true)
      `;
    }

    return NextResponse.json({ success: true, contractId });
  } catch (error) {
    console.error('Error tracking contract:', error);
    // Don't fail the request if tracking fails
    return NextResponse.json(
      { success: false, error: 'Tracking failed' },
      { status: 500 }
    );
  }
}
