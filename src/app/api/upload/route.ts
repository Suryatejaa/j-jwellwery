import { NextRequest, NextResponse } from 'next/server';
import { uploadFileToR2 } from '@/lib/r2-service';

export async function POST(request: NextRequest) {
  try {
    console.log('[UPLOAD] Request received');
    
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    console.log(`[UPLOAD] Files received: ${files.length}`);

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    if (files.length > 6) {
      return NextResponse.json(
        { error: 'Maximum 6 images allowed' },
        { status: 400 }
      );
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      console.log(`[UPLOAD] Processing file: ${file.name}`);
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        return NextResponse.json(
          { error: `File ${file.name} is not an image` },
          { status: 400 }
        );
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: `File ${file.name} exceeds 5MB limit` },
          { status: 400 }
        );
      }

      // Upload to R2
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      const { publicUrl } = await uploadFileToR2(
        buffer,
        file.name,
        file.type,
        'products'
      );

      uploadedUrls.push(publicUrl);
    }

    console.log(`[UPLOAD] Complete. URLs: ${uploadedUrls.length}`);
    return NextResponse.json(
      { urls: uploadedUrls },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[UPLOAD] Error:', error?.message);
    return NextResponse.json(
      { error: error?.message || 'Upload failed' },
      { status: 500 }
    );
  }
}
