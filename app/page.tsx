import type { Metadata } from 'next';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import Hero from './components/Hero';
import { Features } from './components/Features';
import { Testimonials } from './components/Testimonials';
import { CallToAction } from './components/CallToAction';
import { ClientRoyaltyCalculator } from './components/ClientRoyaltyCalculator';
import { ComicBanner } from './components/ComicBanner';
import { ContractList } from '@/app/components/ContractList';
import { jsonLdScriptProps } from 'react-schemaorg';
import { SharkBanner } from './components/SharkBanner';
import { FAQ } from './components/FAQ';

// Metadata for the page
export const metadata: Metadata = {
  title: 'TrackRights | AI-Powered Music Contract Analysis',
  description:
    'TrackRights uses AI to analyze and simplify music contracts. Get clear insights into your music contracts with our free AI-powered analysis tool.',
  keywords: [
    'music contract analysis',
    'AI contract analysis',
    'music producer tools',
    'contract simplification',
    'legal document analysis',
    'music industry contracts',
    'contract review tool',
    'AI legal analysis',
    'music rights management',
    'contract interpretation',
  ],
  openGraph: {
    title: 'TrackRights - AI Music Contract Analysis',
    description:
      'Analyze and understand your music contracts with AI. Free, instant, and producer-friendly.',
    url: 'https://trackrights.com',
    siteName: 'TrackRights',
    images: [
      {
        url: 'https://trackrights.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'TrackRights AI Contract Analysis',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TrackRights - AI Music Contract Analysis',
    description:
      'Analyze and understand your music contracts with AI. Free, instant, and producer-friendly.',
    images: ['https://trackrights.com/twitter-image.jpg'],
    creator: '@trackrights',
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
  alternates: {
    canonical: 'https://trackrights.com',
  },
};

export default function Home() {
  return (
    <>
      {/* Schema.org structured data */}
      <script
        {...jsonLdScriptProps({
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'TrackRights',
          applicationCategory: 'Business',
          description:
            'AI-powered music contract analysis tool for producers and artists',
          operatingSystem: 'Any',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
          },
          featureList: [
            'AI Contract Analysis',
            'Plain English Explanations',
            'Instant Results',
            'Royalty Calculations',
            'Contract Generation',
          ],
        })}
      />
      <script
        {...jsonLdScriptProps({
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
        })}
      />

      <div
        className="flex flex-col min-h-screen scroll-smooth"
        itemScope
        itemType="https://schema.org/WebPage"
      >
        <Header />
        <main className="flex-grow" role="main">
          {/* Hero Section */}
          <section aria-labelledby="hero-heading">
            <h1 id="hero-heading" className="sr-only">
              TrackRights - AI Music Contract Analysis
            </h1>
            <Hero />
          </section>

          {/* ComicBanner Section */}
          <section aria-labelledby="comic-heading">
            <h2 id="comic-heading" className="sr-only">
              Why Choose TrackRights
            </h2>
            <ComicBanner />
          </section>

          {/* Features Section */}
          <section aria-labelledby="features-heading">
            <h2 id="features-heading" className="sr-only">
              Our Features
            </h2>
            <Features id="features" />
          </section>

          {/* SharkBanner Section - Moved here */}
          <section aria-labelledby="banner-heading">
            <h2 id="banner-heading" className="sr-only">
              Why Choose TrackRights
            </h2>
            <SharkBanner />
          </section>

          {/* Contract List Section */}
          <section aria-labelledby="contracts-heading">
            <h2 id="contracts-heading" className="sr-only">
              Available Contract Templates
            </h2>
            <ContractList />
          </section>

          {/* Testimonials Section */}
          <section aria-labelledby="testimonials-heading">
            <h2 id="testimonials-heading" className="sr-only">
              User Testimonials
            </h2>
            <Testimonials id="testimonials" />
          </section>

          {/* FAQ Section */}
          <section aria-labelledby="faq-heading">
            <h2 id="faq-heading" className="sr-only">
              Frequently Asked Questions
            </h2>
            <FAQ id="faq" />
          </section>

          {/* Call to Action Section */}
          <section aria-labelledby="cta-heading">
            <h2 id="cta-heading" className="sr-only">
              Get Started
            </h2>
            <CallToAction />
          </section>
        </main>
        <Footer />
        <aside aria-label="Royalty Calculator">
          <ClientRoyaltyCalculator />
        </aside>
      </div>
    </>
  );
}
