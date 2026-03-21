export async function onRequestPost({ request }: { request: Request }) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File | null;

    if (!image) {
      return new Response(
        JSON.stringify({ success: false, error: 'No image provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!image.type.startsWith('image/')) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid file type' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (image.size > 10 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ success: false, error: 'File too large (max 10MB)' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = process.env.REMOVE_BG_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'API key not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Convert to base64
    const arrayBuffer = await image.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);

    // Call remove.bg API
    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_file_b64: base64,
        size: 'auto',
      }),
    });

    const responseContentType = response.headers.get('content-type');

    if (!response.ok || !responseContentType?.includes('image')) {
      const errorText = await response.text();
      let errorMessage = 'Failed to remove background';

      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.errors?.[0]?.title || errorData.errors?.[0]?.message || errorMessage;
      } catch {
        errorMessage = errorText.substring(0, 100);
      }

      console.error('Remove.bg API error:', errorMessage);
      return new Response(
        JSON.stringify({ success: false, error: errorMessage }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const resultBuffer = await response.arrayBuffer();
    const resultBytes = new Uint8Array(resultBuffer);
    let resultBinary = '';
    for (let i = 0; i < resultBytes.byteLength; i++) {
      resultBinary += String.fromCharCode(resultBytes[i]);
    }
    const resultBase64 = btoa(resultBinary);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          image: `data:image/png;base64,${resultBase64}`,
        },
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error processing image:', errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: `Server error: ${errorMessage}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
