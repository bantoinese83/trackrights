import type { Metadata } from 'next';
import React, { type ReactNode } from 'react';
import { jsonLdScriptProps } from 'react-schemaorg';
import { AdSenseLoader } from '@/components/AdSenseLoader';
import { getAdSenseClientId } from '@/lib/adsense-config';
import { faqItems } from '@/data/faq-items';
import { defaultDescription, SITE_NAME, SITE_URL } from '@/lib/site-config';

const adSenseClientId = getAdSenseClientId();

const faqUrl = `${SITE_URL}/faq`;

export const metadata: Metadata = {
  title: 'FAQ — Music contract analysis questions',
  description:
    'Answers about how TrackRights analyzes music contracts, security, accuracy, limits, and when to consult a lawyer.',
  keywords: [
    'TrackRights FAQ',
    'music contract AI questions',
    'contract analysis help',
    'entertainment lawyer vs AI',
  ],
  alternates: { canonical: faqUrl },
  openGraph: {
    type: 'website',
    url: faqUrl,
    title: `FAQ | ${SITE_NAME}`,
    description: defaultDescription,
    siteName: SITE_NAME,
    locale: 'en_US',
    images: [
      {
        url: `${SITE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} FAQ`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `FAQ | ${SITE_NAME}`,
    description: defaultDescription,
    images: [`${SITE_URL}/twitter-image.jpg`],
  },
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqItems.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
};

/** AdSense script only (account meta is on the home page). */
export default function FAQLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {adSenseClientId ? <AdSenseLoader clientId={adSenseClientId} /> : null}
      <script
        {...(jsonLdScriptProps(
          faqJsonLd
        ) as React.ScriptHTMLAttributes<HTMLScriptElement>)}
      />
      {children}
    </>
  );
}
