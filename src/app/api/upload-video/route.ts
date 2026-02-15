import { NextRequest, NextResponse } from 'next/server';
import { uploadFileToR2 } from '@/lib/r2-service';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('video') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No video file provided' }, { status: 400 });
    }

    // Validate MIME type
    if (!file.type.startsWith('video/')) {
      return NextResponse.json({ error: 'Provided file is not a video' }, { status: 400 });
    }

    // Enforce max size: 2MB (2048 KB) (user requirement)
    const MAX_VIDEO_BYTES = 2 * 1024 * 1024; // 2 MB
    if (file.size > MAX_VIDEO_BYTES) {
      return NextResponse.json({ error: `Video exceeds 2MB (2048 KB) limit` }, { status: 400 });
    }

    // Upload to R2 under `products/videos`
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { publicUrl } = await uploadFileToR2(buffer, file.name, file.type, 'products/videos');

    return NextResponse.json({ url: publicUrl }, { status: 200 });
  } catch (err: any) {
    console.error('[UPLOAD-VIDEO] Error:', err?.message || err);
    return NextResponse.json({ error: 'Video upload failed' }, { status: 500 });
  }
}
