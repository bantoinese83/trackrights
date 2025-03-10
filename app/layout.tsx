import './globals.css';
import { Metadata } from 'next';
import React from 'react';
import { jsonLdScriptProps } from 'react-schemaorg';
import { CookieConsent } from './components/CookieConsent';
import { StateProvider } from '@/lib/StateContext';
import ErrorBoundary from './components/ErrorBoundary';
import { Analytics } from '@vercel/analytics/react';

export const metadata: Metadata = {
  metadataBase: new URL('https://trackrights.com'),
  title: {
    default: 'TrackRights | AI-Powered Music Contract Analysis',
    template: '%s | TrackRights',
  },
  description:
    'TrackRights uses AI to simplify and explain music contracts in producer-friendly terms. Understand complex legal jargon effortlessly.',
  keywords: [
    'music contract analysis',
    'AI contract simplification',
    'music producer tools',
    'legal jargon simplification',
    'contract review',
    'music industry',
  ],
  authors: [{ name: 'TrackRights Team' }],
  creator: 'TrackRights',
  publisher: 'TrackRights',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://trackrights.com',
    siteName: 'TrackRights',
    title: 'TrackRights - AI-Powered Music Contract Analysis',
    description:
      'Simplify your music contracts with AI. Understand legal terms easily.',
    images: [
      {
        url: 'https://trackrights.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'TrackRights - AI-Powered Music Contract Analysis',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TrackRights - AI-Powered Music Contract Analysis',
    description:
      'Simplify your music contracts with AI. Understand legal terms easily.',
    images: ['https://trackrights.com/twitter-image.jpg'],
    creator: '@trackrights',
    site: '@trackrights',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  alternates: {
    canonical: 'https://trackrights.com',
    languages: {
      'en-US': 'https://trackrights.com',
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>TrackRights | AI-Powered Music Contract Analysis</title>
        <meta name="google-adsense-account" content="ca-pub-2126374418379576" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href="https://trackrights.com" />
        <link rel="manifest" href="/site.webmanifest" />
        <script
          {...(jsonLdScriptProps({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'TrackRights',
            url: 'https://trackrights.com',
            potentialAction: {
              '@type': 'SearchAction',
              target: {
                '@type': 'EntryPoint',
                urlTemplate:
                  'https://trackrights.com/search?q={search_term_string}',
              },
              'query-input': 'required name=search_term_string',
            },
          }) as React.ScriptHTMLAttributes<HTMLScriptElement>)}
        />
        <script
          {...(jsonLdScriptProps({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'TrackRights',
            url: 'https://trackrights.com',
            logo: 'https://trackrights.com/logo.png',
            sameAs: [
              'https://twitter.com/trackrights',
              'https://www.facebook.com/trackrights',
              'https://www.linkedin.com/company/trackrights',
            ],
          }) as React.ScriptHTMLAttributes<HTMLScriptElement>)}
        />
      </head>
      <StateProvider>
        <ErrorBoundary>
          <body>
            {children}
            <Analytics />
            <CookieConsent />
          </body>
        </ErrorBoundary>
      </StateProvider>
    </html>
  );
}
