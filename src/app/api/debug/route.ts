import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  const apiKey = process.env.REMOVE_BG_API_KEY;

  return NextResponse.json({
    hasApiKey: !!apiKey,
    apiKeyPrefix: apiKey ? apiKey.substring(0, 5) + '...' : 'none',
    apiKeyLength: apiKey ? apiKey.length : 0,
  });
}
