import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get('title') ?? 'TrackRights';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#4B0082',
          fontSize: 60,
          fontWeight: 800,
          color: 'white',
          padding: '0 120px',
          textAlign: 'center',
        }}
      >
        <div style={{ marginBottom: 40 }}>TrackRights</div>
        <div style={{ fontSize: 40 }}>{title}</div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
