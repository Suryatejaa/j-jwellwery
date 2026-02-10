import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

function getS3Client() {
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
  const accountId = process.env.R2_ACCOUNT_ID?.trim();

  if (!accessKeyId || !secretAccessKey || !accountId) {
    throw new Error('R2 credentials not configured');
  }

  return new S3Client({
    region: 'auto',
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    forcePathStyle: true,
  });
}

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

    const bucketUrl = process.env.NEXT_PUBLIC_R2_BUCKET_URL?.trim();
    if (!bucketUrl) {
      return NextResponse.json(
        { error: 'R2 bucket URL not configured' },
        { status: 500 }
      );
    }

    const uploadedUrls: string[] = [];
    const s3Client = getS3Client();

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

      // Generate unique filename
      const ext = file.name.split('.').pop();
      const filename = `products/${uuidv4()}.${ext}`;

      // Upload to R2
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      await s3Client.send(
        new PutObjectCommand({
          Bucket: 'j-jwellery',
          Key: filename,
          Body: buffer,
          ContentType: file.type,
        })
      );

      // Return private authenticated URL (will be converted to public for display)
      const accountId = process.env.R2_ACCOUNT_ID?.trim();
      const privateUrl = `https://${accountId}.r2.cloudflarestorage.com/j-jwellery/${filename}`;
      uploadedUrls.push(privateUrl);
      console.log(`[UPLOAD] Uploaded: ${filename} → private URL`);
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
