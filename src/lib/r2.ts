export type R2Config = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketUrl: string;
  bucketName: string;
};

const DEFAULT_BUCKET_NAME = 'j-jwellery';

function normalizeBucketUrl(value: string) {
  return value.replace(/\/+$/, '');
}

export function getR2Config(): R2Config {
  const accountId = process.env.R2_ACCOUNT_ID?.trim();
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
  const bucketUrlRaw = process.env.NEXT_PUBLIC_R2_BUCKET_URL?.trim();
  const bucketName = process.env.R2_BUCKET_NAME?.trim() || DEFAULT_BUCKET_NAME;

  const missing: string[] = [];
  if (!accountId) missing.push('R2_ACCOUNT_ID');
  if (!accessKeyId) missing.push('R2_ACCESS_KEY_ID');
  if (!secretAccessKey) missing.push('R2_SECRET_ACCESS_KEY');
  if (!bucketUrlRaw) missing.push('NEXT_PUBLIC_R2_BUCKET_URL');

  if (missing.length) {
    console.error('[R2] Missing required environment variables:', missing.join(', '));
    throw new Error('Server not configured for image uploads');
  }

  return {
    accountId: accountId!,
    accessKeyId: accessKeyId!,
    secretAccessKey: secretAccessKey!,
    bucketUrl: normalizeBucketUrl(bucketUrlRaw!),
    bucketName,
  };
}
