import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

function getS3Client() {
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
  const accountId = process.env.R2_ACCOUNT_ID?.trim();

  return new S3Client({
    region: 'auto',
    credentials: {
      accessKeyId: accessKeyId || '',
      secretAccessKey: secretAccessKey || '',
    },
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    forcePathStyle: true,
  });
}

export async function POST(request: NextRequest) {
  try {
    const { fileName } = await request.json();

    if (!fileName) {
      return NextResponse.json(
        { error: 'fileName is required' },
        { status: 400 }
      );
    }

    const accountId = process.env.R2_ACCOUNT_ID?.trim();
    if (!accountId) {
      return NextResponse.json(
        { error: 'R2 account ID not configured' },
        { status: 500 }
      );
    }

    // Generate unique key with products prefix
    const ext = fileName.split('.').pop();
    const key = `products/${uuidv4()}.${ext}`;

    const s3Client = getS3Client();

    // Generate presigned URL for uploading
    const uploadUrl = await getSignedUrl(
      s3Client,
      new PutObjectCommand({
        Bucket: 'j-jwellery',
        Key: key,
      }),
      { expiresIn: 3600 } // 1 hour
    );

    // Construct public URL for accessing the file
    const publicUrl = `https://${accountId}.r2.cloudflarestorage.com/j-jwellery/${key}`;

    return NextResponse.json(
      {
        uploadUrl,
        publicUrl,
        key,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[UPLOAD-URL] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}
