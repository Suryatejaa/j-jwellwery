/**
 * Pass through public R2 URLs directly
 * No conversion needed - URLs from API are already public
 */
export function convertPrivateToPublicR2Url(imageUrl: string): string {
  return imageUrl;
}
