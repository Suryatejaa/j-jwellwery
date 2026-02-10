import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL required' },
        { status: 400 }
      );
    }

    // Decode the URL
    const decodedUrl = decodeURIComponent(imageUrl);
    console.log('[IMAGE-PROXY] Fetching image from:', decodedUrl);

    // Fetch the image from R2
    const response = await fetch(decodedUrl);

    if (!response.ok) {
      console.error('[IMAGE-PROXY] Failed to fetch image:', response.statusText);
      return NextResponse.json(
        { error: 'Failed to fetch image' },
        { status: response.status }
      );
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      },
    });
  } catch (error: any) {
    console.error('[IMAGE-PROXY] Error:', error?.message);
    return NextResponse.json(
      { error: 'Failed to proxy image' },
      { status: 500 }
    );
  }
}
