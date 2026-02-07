import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { getR2Config } from '@/lib/r2';

function getS3Client(config: ReturnType<typeof getR2Config>) {
  return new S3Client({
    region: 'auto',
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
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

    const config = getR2Config();

    // Generate unique key with products prefix
    const ext = fileName.split('.').pop();
    const key = `products/${uuidv4()}.${ext}`;

    const s3Client = getS3Client(config);

    // Generate presigned URL for uploading
    const uploadUrl = await getSignedUrl(
      s3Client,
      new PutObjectCommand({
        Bucket: config.bucketName,
        Key: key,
      }),
      { expiresIn: 3600 } // 1 hour
    );

    // Construct public URL for accessing the file
    const publicUrl = `${config.bucketUrl}/${key}`;

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
