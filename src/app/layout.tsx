import './globals.css';
import type { Metadata, Viewport } from 'next';
import React from 'react';
import { jsonLdScriptProps } from 'react-schemaorg';
import { CookieConsent } from '@/components/CookieConsent';
import { StateProvider } from '@/lib/contexts/StateContext';
import { ModalProvider } from '@/lib/contexts/ModalContext';
import { TourProvider } from '@/lib/contexts/TourContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Analytics } from '@vercel/analytics/react';
import { defaultDescription, SITE_NAME, SITE_URL } from '@/lib/site-config';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | AI-Powered Music Contract Analysis`,
    template: `%s | ${SITE_NAME}`,
  },
  description: defaultDescription,
  keywords: [
    'music contract analysis',
    'AI contract simplification',
    'music industry tools',
    'artist contract analysis',
    'songwriter contract analysis',
    'producer contract analysis',
    'manager contract analysis',
    'streamer contract analysis',
    'influencer contract analysis',
    'brand sponsorship agreement',
    'Twitch partnership contract',
    'YouTube contract analysis',
    'TikTok creator contract',
    'legal jargon simplification',
    'contract review',
    'music industry',
    'streaming contracts',
    'influencer marketing contracts',
    'music law',
    'entertainment law',
  ],
  authors: [{ name: `${SITE_NAME} Team` }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: SITE_NAME,
    title: `${SITE_NAME} - AI-Powered Music Contract Analysis`,
    description:
      'Simplify your music contracts with AI. Understand legal terms easily.',
    images: [
      {
        url: `${SITE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} - AI-Powered Music Contract Analysis`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} - AI-Powered Music Contract Analysis`,
    description:
      'Simplify your music contracts with AI. Understand legal terms easily.',
    images: [`${SITE_URL}/twitter-image.jpg`],
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
  ...(process.env['NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION']?.trim()
    ? {
        verification: {
          google: process.env['NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION'],
        },
      }
    : {}),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          {...(jsonLdScriptProps({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: SITE_NAME,
            url: SITE_URL,
          }) as React.ScriptHTMLAttributes<HTMLScriptElement>)}
        />
        <script
          {...(jsonLdScriptProps({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: SITE_NAME,
            url: SITE_URL,
            logo: `${SITE_URL}/logo.png`,
            sameAs: [
              'https://twitter.com/trackrights',
              'https://www.facebook.com/trackrights',
              'https://www.linkedin.com/company/trackrights',
            ],
          }) as React.ScriptHTMLAttributes<HTMLScriptElement>)}
        />
      </head>
      <StateProvider>
        <ModalProvider>
          <TourProvider>
            <ErrorBoundary>
              <body>
                {children}
                <Analytics />
                <CookieConsent />
              </body>
            </ErrorBoundary>
          </TourProvider>
        </ModalProvider>
      </StateProvider>
    </html>
  );
}
