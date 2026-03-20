import { NextResponse } from 'next/server';
import { GoogleGenAI, Modality } from '@google/genai';
import { getApiKey, getGeminiApiKeys } from '@/app/api/utils';
import { shouldRotateGeminiKey } from '@/lib/ai-retry';
import { logError } from '@/lib/errors';

/**
 * Generate ephemeral token for Live API connection
 * Ephemeral tokens are short-lived and secure for client-side use
 * They expire after 30 minutes and can only be used once to start a session
 */
export async function POST() {
  try {
    const keys = getGeminiApiKeys();
    if (keys.length === 0) {
      getApiKey();
    }

    const expireTime = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 minutes
    const newSessionExpireTime = new Date(
      Date.now() + 1 * 60 * 1000
    ).toISOString(); // 1 minute

    let lastError: unknown;
    for (let i = 0; i < keys.length; i++) {
      const apiKey = keys[i];
      try {
        const client = new GoogleGenAI({ apiKey });
        const token = await client.authTokens.create({
          config: {
            uses: 1,
            expireTime,
            newSessionExpireTime,
            liveConnectConstraints: {
              model: 'gemini-2.5-flash-native-audio-preview-12-2025',
              config: {
                sessionResumption: {},
                responseModalities: [Modality.AUDIO],
              },
            },
            httpOptions: {
              apiVersion: 'v1alpha',
            },
          },
        });

        return NextResponse.json({
          token: token.name,
          expiresAt: expireTime,
        });
      } catch (error) {
        lastError = error;
        if (i < keys.length - 1 && shouldRotateGeminiKey(error)) {
          logError(error, {
            liveLawyerTokenFallback: true,
            keyIndex: i,
          });
          continue;
        }
        throw error;
      }
    }
    throw lastError;
  } catch (error) {
    console.error('Error generating ephemeral token:', error);
    return NextResponse.json(
      { error: 'Failed to generate authentication token' },
      { status: 500 }
    );
  }
}
