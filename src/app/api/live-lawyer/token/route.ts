import { NextResponse } from 'next/server';
import { GoogleGenAI, Modality } from '@google/genai';
import { getApiKey } from '@/app/api/utils';

/**
 * Generate ephemeral token for Live API connection
 * Ephemeral tokens are short-lived and secure for client-side use
 * They expire after 30 minutes and can only be used once to start a session
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

    // Create GoogleGenAI client with API key (server-side only)
    const client = new GoogleGenAI({ apiKey });

    // Calculate expiration times
    const expireTime = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 minutes
    const newSessionExpireTime = new Date(
      Date.now() + 1 * 60 * 1000
    ).toISOString(); // 1 minute

    // Generate ephemeral token with constraints for security
    const token = await client.authTokens.create({
      config: {
        uses: 1, // Token can only be used to start a single session
        expireTime: expireTime, // Token expires in 30 minutes
        newSessionExpireTime: newSessionExpireTime, // 1 minute window to start new session
        liveConnectConstraints: {
          model: 'gemini-2.5-flash-native-audio-preview-12-2025',
          config: {
            sessionResumption: {}, // Allow session resumption
            responseModalities: [Modality.AUDIO], // Lock to audio only
          },
        },
        httpOptions: {
          apiVersion: 'v1alpha', // Required for ephemeral tokens
        },
      },
    });

    // Return the token name (not the raw API key)
    // The token.name is what the client uses as the apiKey parameter
    return NextResponse.json({
      token: token.name, // This is the ephemeral token to use
      expiresAt: expireTime,
    });
  } catch (error) {
    console.error('Error generating ephemeral token:', error);
    return NextResponse.json(
      { error: 'Failed to generate authentication token' },
      { status: 500 }
    );
  }
}
