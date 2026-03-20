'use client';

import Script from 'next/script';

type Props = { clientId: string };

/**
 * Loads the AdSense script only on routes that render this component (policy: no ads on
 * navigation-only, empty, or thin utility pages).
 */
export function AdSenseLoader({ clientId }: Props) {
  return (
    <Script
      id="adsense-autoload"
      strategy="afterInteractive"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(clientId)}`}
      crossOrigin="anonymous"
    />
  );
}
