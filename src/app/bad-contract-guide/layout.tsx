import type { Metadata } from 'next';
import React, { type ReactNode } from 'react';
import { jsonLdScriptProps } from 'react-schemaorg';
import { AdSenseLoader } from '@/components/AdSenseLoader';
import { getAdSenseClientId } from '@/lib/adsense-config';
import { badContractGuideMeta } from '@/data/bad-contract-guide';
import { SITE_NAME, SITE_URL } from '@/lib/site-config';

const adSenseClientId = getAdSenseClientId();

const guideUrl = `${SITE_URL}/bad-contract-guide`;

const pageDescription =
  'Learn common red flags in recording deals: one-sided terms, 360 language, royalty deductions, vague delivery, and what fairer deals often include. Education only — not legal advice.';

export const metadata: Metadata = {
  title: 'Bad music contract red flags — what to watch for',
  description: pageDescription,
  keywords: [
    'bad music contract',
    'recording contract red flags',
    '360 deal explained',
    'music contract review',
    'artist contract terms',
  ],
  alternates: { canonical: guideUrl },
  openGraph: {
    type: 'article',
    url: guideUrl,
    title: `${badContractGuideMeta.title} | ${SITE_NAME}`,
    description: pageDescription,
    siteName: SITE_NAME,
    locale: 'en_US',
    images: [
      {
        url: `${SITE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — contract education`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${badContractGuideMeta.title} | ${SITE_NAME}`,
    description: pageDescription,
    images: [`${SITE_URL}/twitter-image.jpg`],
  },
};

const articleJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: badContractGuideMeta.title,
  description: pageDescription,
  inLanguage: 'en-US',
  isAccessibleForFree: true,
  author: {
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
  },
  publisher: {
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
  },
  mainEntityOfPage: { '@type': 'WebPage', '@id': guideUrl },
  url: guideUrl,
};

export default function BadContractGuideLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      {adSenseClientId ? <AdSenseLoader clientId={adSenseClientId} /> : null}
      <script
        {...(jsonLdScriptProps(
          articleJsonLd
        ) as React.ScriptHTMLAttributes<HTMLScriptElement>)}
      />
      {children}
    </>
  );
}
