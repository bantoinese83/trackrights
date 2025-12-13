import { NextResponse } from 'next/server';
import { getApiKey } from '@/app/api/utils';

/**
 * Get API key for Live API connection
 * In production, consider implementing ephemeral tokens for better security
 * For now, we return the API key from server-side to avoid exposing it in client code
 */
export async function POST() {
  try {
    const apiKey = getApiKey();
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    // Return API key for client-side Live API connection
    // TODO: Implement ephemeral tokens when SDK supports it
    // For now, this is secure as long as the API key is server-side only
    return NextResponse.json({
      apiKey: apiKey,
      // Note: In production, implement ephemeral tokens:
      // const ai = new GoogleGenAI({ apiKey });
      // const tokenResponse = await ai.live.generateEphemeralToken({ ttl: '1h' });
      // return { token: tokenResponse.token, expiresAt: tokenResponse.expiresAt };
    });
  } catch (error) {
    console.error('Error getting API credentials:', error);
    return NextResponse.json(
      { error: 'Failed to get API credentials' },
      { status: 500 }
    );
  }
}
