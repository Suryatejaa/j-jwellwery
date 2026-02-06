import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

function getS3Client() {
  return new S3Client({
    region: 'auto',
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    },
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    forcePathStyle: true,
  });
}

export async function POST(request: NextRequest) {
  try {
    // Validate environment variables
    if (!process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
      console.error('R2 credentials not configured');
      return NextResponse.json(
        { error: 'Server not configured for image uploads' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

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
    const s3Client = getS3Client();

    for (const file of files) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        return NextResponse.json(
          { error: `File ${file.name} is not an image` },
          { status: 400 }
        );
      }

      // Validate file size (max 5MB per image)
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: `File ${file.name} is too large (max 5MB)` },
          { status: 400 }
        );
      }

      // Generate unique filename
      const ext = file.name.split('.').pop();
      const filename = `${uuidv4()}.${ext}`;

      // Read file buffer
      const buffer = await file.arrayBuffer();

      // Upload to R2
      const command = new PutObjectCommand({
        Bucket: 'j-jwellery',
        Key: filename,
        Body: new Uint8Array(buffer),
        ContentType: file.type,
      });

      await s3Client.send(command);

      // Generate public URL
      const url = `${process.env.NEXT_PUBLIC_R2_BUCKET_URL}/${filename}`;
      uploadedUrls.push(url);
    }

    return NextResponse.json(
      { urls: uploadedUrls, message: 'Images uploaded successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error uploading to R2:', error);
    return NextResponse.json(
      { error: 'Failed to upload images' },
      { status: 500 }
    );
  }
}
