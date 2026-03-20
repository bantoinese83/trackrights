/**
 * AdSense client id for optional auto ads. Set NEXT_PUBLIC_ADSENSE_CLIENT_ID to override,
 * or set it to an empty string to disable loading the AdSense script in development.
 */
export function getAdSenseClientId(): string | null {
  const fromEnv = process.env['NEXT_PUBLIC_ADSENSE_CLIENT_ID']?.trim();
  if (fromEnv === '') {
    return null;
  }
  if (fromEnv) {
    return fromEnv;
  }
  return 'ca-pub-2126374418379576';
}
