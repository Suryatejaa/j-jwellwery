/**
 * Convert R2 URL to proxy URL for CORS-safe image loading
 * Proxies all R2 images through /api/image-proxy to avoid CORS issues
 */
export function convertPrivateToPublicR2Url(imageUrl: string): string {
  // If it's a placeholder or already a data URL, return as-is
  if (!imageUrl || imageUrl.startsWith('/') || imageUrl.startsWith('data:')) {
    return imageUrl;
  }

  // If it's an R2 URL (contains r2.dev or cloudflarestorage), proxy it
  if (imageUrl.includes('r2.dev') || imageUrl.includes('cloudflarestorage')) {
    return `/api/image-proxy?url=${encodeURIComponent(imageUrl)}`;
  }

  // Otherwise return as-is
  return imageUrl;
}
