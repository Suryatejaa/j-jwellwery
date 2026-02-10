import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

function getS3Client() {
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
  const endpoint = process.env.R2_ENDPOINT?.trim();

  if (!accessKeyId || !secretAccessKey || !endpoint) {
    throw new Error('R2 credentials not configured');
  }

  return new S3Client({
    region: 'auto',
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    endpoint,
  });
}

/**
 * Upload file to R2 and return public URL
 * @param {Buffer} fileBuffer - File contents
 * @param {string} fileName - Original file name
 * @param {string} contentType - MIME type
 * @param {string} folder - Folder path (e.g., 'products')
 * @returns {Promise<{publicUrl: string, key: string}>}
 */
export async function uploadFileToR2(
  fileBuffer: Buffer, 
  fileName: string, 
  contentType: string, 
  folder: string = 'products'
): Promise<{ publicUrl: string; key: string }> {
  const bucketName = process.env.R2_BUCKET_NAME || 'j-jwellery';
  const bucketUrl = process.env.NEXT_PUBLIC_R2_BUCKET_URL;

  if (!bucketUrl) {
    throw new Error('R2 bucket URL not configured');
  }

  // Generate unique key
  const timestamp = Date.now();
  const ext = fileName.split('.').pop();
  const key = `${folder}/${timestamp}-${Math.random().toString(36).substr(2, 9)}.${ext}`;

  const s3Client = getS3Client();

  // Upload to R2
  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
    })
  );

  // Construct and return public URL
  const publicUrl = `${bucketUrl}/${key}`;

  console.log(`[R2] Uploaded: ${key} → ${publicUrl}`);

  return { publicUrl, key };
}

/**
 * Delete file from R2
 * @param {string} key - File key in R2 bucket
 */
export async function deleteFileFromR2(key: string): Promise<void> {
  const bucketName = process.env.R2_BUCKET_NAME || 'j-jwellery';
  const s3Client = getS3Client();

  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    })
  );

  console.log(`[R2] Deleted: ${key}`);
}

/**
 * Get presigned upload URL (for client-side direct uploads)
 * @param {string} fileName - Original file name
 * @param {string} folder - Folder path (e.g., 'products')
 * @param {number} expiresIn - URL expiry in seconds (default: 1 hour)
 * @returns {Promise<{uploadUrl: string, publicUrl: string, key: string}>}
 */
export async function getPresignedUploadUrl(
  fileName: string, 
  folder: string = 'products', 
  expiresIn: number = 3600
): Promise<{ uploadUrl: string; publicUrl: string; key: string }> {
  const bucketName = process.env.R2_BUCKET_NAME || 'j-jwellery';
  const bucketUrl = process.env.NEXT_PUBLIC_R2_BUCKET_URL;

  if (!bucketUrl) {
    throw new Error('R2 bucket URL not configured');
  }

  // Generate unique key
  const ext = fileName.split('.').pop();
  const key = `${folder}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`;

  const s3Client = getS3Client();

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn });
  const publicUrl = `${bucketUrl}/${key}`;

  console.log(`[R2] Generated upload URL for: ${key}`);

  return { uploadUrl, publicUrl, key };
}
