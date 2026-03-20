import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { SITE_NAME, SITE_URL } from '@/lib/site-config';

const cookiesUrl = `${SITE_URL}/cookies`;

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: `How ${SITE_NAME} uses cookies for essential features, analytics, preferences, and ads. Manage cookie settings in your browser.`,
  alternates: { canonical: cookiesUrl },
  openGraph: {
    type: 'website',
    url: cookiesUrl,
    siteName: SITE_NAME,
    title: `Cookie Policy | ${SITE_NAME}`,
    description: `Cookie types, controls, and updates for ${SITE_NAME}.`,
  },
  twitter: {
    card: 'summary',
    title: `Cookie Policy | ${SITE_NAME}`,
    description: `How ${SITE_NAME} uses cookies and how you can manage them.`,
  },
};

export default function CookiesLayout({ children }: { children: ReactNode }) {
  return children;
}
