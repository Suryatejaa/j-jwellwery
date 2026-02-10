/**
 * Pass through R2 URLs directly - they are already public and accessible
 * No conversion needed since URLs are already public CDN URLs
 */
export function convertPrivateToPublicR2Url(imageUrl: string): string {
  return imageUrl;
}
