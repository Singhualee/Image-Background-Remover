import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const image = formData.get('image') as File | null;

    if (!image) {
      return NextResponse.json(
        { success: false, error: 'No image provided' },
        { status: 400 }
      );
    }

    if (!image.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type' },
        { status: 400 }
      );
    }

    if (image.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'File too large (max 10MB)' },
        { status: 400 }
      );
    }

    const apiKey = process.env.REMOVE_BG_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'API key not configured' },
        { status: 500 }
      );
    }

    // Convert to base64 without Buffer (Cloudflare Workers compatible)
    const arrayBuffer = await image.arrayBuffer();
    const base64 = btoa(
      new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );

    // Call remove.bg API
    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
      },
      body: JSON.stringify({
        image_file_b64: base64,
        size: 'auto',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Remove.bg API error:', errorText);
      return NextResponse.json(
        { success: false, error: 'Failed to remove background' },
        { status: 500 }
      );
    }

    const resultBuffer = await response.arrayBuffer();
    const resultBase64 = btoa(
      new Uint8Array(resultBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );

    return NextResponse.json({
      success: true,
      data: {
        image: `data:image/png;base64,${resultBase64}`,
      },
    });
  } catch (error) {
    console.error('Error processing image:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
