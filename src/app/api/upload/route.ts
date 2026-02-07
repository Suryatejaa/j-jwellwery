import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

function getS3Client() {
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
  const accountId = process.env.R2_ACCOUNT_ID?.trim();

  console.log('[S3CLIENT] Creating S3 client');

  return new S3Client({
    region: 'us-east-1',
    credentials: {
      accessKeyId: accessKeyId || '',
      secretAccessKey: secretAccessKey || '',
    },
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    forcePathStyle: true,
    // Disable SHA256 checksum calculation
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED',
  });
  
}

export async function POST(request: NextRequest) {
  try {
    console.log('[UPLOAD] Request received');
    
    // Validate environment variables
    console.log('[UPLOAD] Checking R2 credentials...');
    console.log('[UPLOAD] R2_ACCOUNT_ID:', process.env.R2_ACCOUNT_ID ? 'SET' : 'MISSING');
    console.log('[UPLOAD] R2_ACCESS_KEY_ID:', process.env.R2_ACCESS_KEY_ID ? 'SET' : 'MISSING');
    console.log('[UPLOAD] R2_SECRET_ACCESS_KEY:', process.env.R2_SECRET_ACCESS_KEY ? 'SET' : 'MISSING');
    console.log('[UPLOAD] NEXT_PUBLIC_R2_BUCKET_URL:', process.env.NEXT_PUBLIC_R2_BUCKET_URL);
    
    if (!process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
      console.error('[UPLOAD] R2 credentials not configured');
      return NextResponse.json(
        { error: 'Server not configured for image uploads' },
        { status: 500 }
      );
    }

    console.log('[UPLOAD] Parsing form data...');
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    console.log(`[UPLOAD] Files received: ${files.length}`);

    if (!files || files.length === 0) {
      console.error('[UPLOAD] No files provided');
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    if (files.length > 6) {
      console.error(`[UPLOAD] Too many files: ${files.length}`);
      return NextResponse.json(
        { error: 'Maximum 6 images allowed' },
        { status: 400 }
      );
    }

    const uploadedUrls: string[] = [];
    console.log('[UPLOAD] Creating S3 client...');
    const s3Client = getS3Client();

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log(`[UPLOAD] Processing file ${i + 1}/${files.length}: ${file.name} (${file.size} bytes, type: ${file.type})`);
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        console.error(`[UPLOAD] File ${file.name} is not an image. Type: ${file.type}`);
        return NextResponse.json(
          { error: `File ${file.name} is not an image` },
          { status: 400 }
        );
      }

      // Validate file size (max 5MB per image)
      if (file.size > 5 * 1024 * 1024) {
        console.error(`[UPLOAD] File ${file.name} is too large: ${file.size} bytes`);
        return NextResponse.json(
          { error: `File ${file.name} is too large (max 5MB)` },
          { status: 400 }
        );
      }

      // Generate unique filename
      const ext = file.name.split('.').pop();
      const filename = `${uuidv4()}.${ext}`;
      console.log(`[UPLOAD] Generated filename: ${filename}`);

      // Read file buffer
      console.log('[UPLOAD] Reading file buffer...');
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      console.log(`[UPLOAD] File buffer size: ${buffer.byteLength} bytes`);

      // Upload to R2
      console.log(`[UPLOAD] Uploading to R2 bucket 'j-jwellery' with key '${filename}'...`);
      try {
        const command = new PutObjectCommand({
          Bucket: 'j-jwellery',
          Key: filename,
          Body: buffer,
          ContentType: file.type,
          ChecksumAlgorithm: undefined as any,
        });

        await s3Client.send(command);
        console.log(`[UPLOAD] File uploaded successfully: ${filename}`);
      } catch (uploadError: any) {
        console.error('[UPLOAD] S3 Upload error:', {
          message: uploadError.message,
          code: uploadError.code,
          name: uploadError.name,
          statusCode: uploadError.$metadata?.httpStatusCode,
        });
        throw uploadError;
      }

      // Generate public URL
      const url = `${process.env.NEXT_PUBLIC_R2_BUCKET_URL}/${filename}`;
      console.log(`[UPLOAD] Generated public URL: ${url}`);
      uploadedUrls.push(url);
    }

    console.log(`[UPLOAD] All files uploaded successfully. URLs: ${uploadedUrls.length}`);
    return NextResponse.json(
      { urls: uploadedUrls, message: 'Images uploaded successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('========== ERROR UPLOADING TO R2 ==========');
    console.error('Error message:', error?.message);
    console.error('Error code:', error?.code);
    console.error('Error name:', error?.name);
    console.error('Full error:', JSON.stringify(error, null, 2));
    console.error('=========================================');
    
    return NextResponse.json(
      { error: error?.message || 'Failed to upload images' },
      { status: 500 }
    );
  }
}
