import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import Hero from '@/components/Hero';
import { Features } from '@/components/Features';
import { Testimonials } from '@/components/Testimonials';
import { CallToAction } from '@/components/CallToAction';
import { ClientRoyaltyCalculator } from '@/components/ClientRoyaltyCalculator';
import { ComicBanner } from '@/components/ComicBanner';
import { ContractList } from '@/components/ContractList';
import { jsonLdScriptProps } from 'react-schemaorg';
import { FAQ } from '@/components/FAQ';

// Metadata for the page
export const metadata: Metadata = {
  title: 'TrackRights | AI-Powered Music Contract Analysis with Live Lawyer',
  description:
    'TrackRights uses AI to analyze and simplify music contracts. Get clear insights into your music contracts with our free AI-powered analysis tool. Plus, chat with our Live Lawyer AI in real-time to ask questions about your contract.',
  keywords: [
    'music contract analysis AI',
    'AI music contract review',
    'live lawyer AI',
    'real-time contract consultation',
    'voice AI legal assistant',
    'music contract analyzer',
    'music contract analysis for all professionals',
    'artist contract analysis',
    'songwriter contract analysis',
    'indie artist contracts',

    // Benefits & Features
    'free music contract analysis',
    'instant contract review',
    'contract simplification',
    'legal document analysis music',
    'contract review tool',
    'AI legal analysis music',
    'royalty analysis tool',
    'contract red flags checker',
    'contract fairness checker',
    'contract term explanation',
    'contract clause analyzer',
    'contract term decoder',
    'contract term finder',
    'contract term helper',
    'contract term guide',
    'contract term advisor',
    'contract term master',
    'contract term scanner',

    // Contract Types (Specific & Long-Tail)
    'music publishing agreements analysis',
    'record label contracts review',
    'songwriter agreement checker',
    'music agreement checker',
    'music distribution deals analysis',
    'sync licensing agreements analysis',
    'beat licensing contracts review',
    'music collaboration agreements analysis',
    'sample clearance contracts analysis',
    'artist management deals review',
    'digital distribution agreements analysis',
    'streaming platform contracts analysis',

    // Rights & Legal Aspects
    'music rights management',
    'music rights protection',
    'music rights advisor',
    'music rights checker',
    'music rights scanner',
    'music rights guide',
    'music rights assistant',
    'music rights verifier',
    'music rights mentor',
    'music rights guardian',
    'music rights shield',
    'music rights expert',
    'rights verification tool',
    'rights analysis system',
    'rights analysis expert',
    'rights rescue tool',
    'rights safety net',
    'rights management system',
    'rights checker tool',
    'rights mentor',
    'rights verifier',
    'rights shield',
    'rights expert',
    'rights tool',
    'rights mentor',
    'rights guardian',
    'rights shield',
    'rights expert',
    'rights tool',
    'rights mentor',

    // Alternatives & Comparisons
    'music lawyer alternative',
    'music legal assistant',
    'music contract advisor',
    'music contract coach',
    'music contract mentor',
    'music contract sage',
    'music contract genius',
    'music contract wizard',
    'music contract expert',
    'music contract reviewer',
    'music contract scanner',
    'music contract comparison',
    'music contract clarity',
    'music contract breakdown',
    'music contract helper',
    'music contract draft',
    'music contract terms',
    'music agreement review',
    'music deal analyzer',
    'music deal simulator',
    'music deal assistant',
    'music deal evaluator',
    'music deal scanner',
    'music deal reviewer',
    'music deal compass',
    'music deal defender',
    'music deal guardian',
    'music deal doctor',
    'music deal expert',
    'music deal inspector',
    'music deal checker',
    'music deal mentor',
    'music deal compass',
    'music deal defender',
    'music deal guardian',
    'music deal doctor',
    'music deal expert',
    'music deal inspector',
    'music deal checker',
    'music deal mentor',

    // Specific Calculations & Tools
    'royalty calculator music',
    'royalty rate checker',
    'music revenue analysis',
    'music rights calculator',
    'music split sheets',
    'song ownership analysis',
    'master recording rights',
    'performance rights analysis',
    'recording contract review',
    'music contract templates',
    'music advancement deals',
    'music deal analyzer',
    'music deal simulator',
    'music deal assistant',
    'music deal evaluator',
    'music deal scanner',
    'music deal reviewer',
    'music deal compass',
    'music deal defender',
    'music deal guardian',
    'music deal doctor',
    'music deal expert',
    'music deal inspector',
    'music deal checker',
    'music deal mentor',
    'music deal compass',
    'music deal defender',
    'music deal guardian',
    'music deal doctor',
    'music deal expert',
    'music deal inspector',
    'music deal checker',
    'music deal mentor',

    // Trust & Safety
    'music contract safety',
    'contract safe checker',
    'contract safe guard',
    'artist protection tool',
    'music professional protection tool',
    'songwriter protection',
    'artist deal checker',
    'artist contract aid',
    'artist deal mentor',
    'artist agreement analysis',
    'music professional protection system',
    'music agreement aid',
    'music deal guide',
    'music deal analyzer',
    'music contract guide',
    'industry professional protection tool',
    'music agreement aid',
    'music deal guide',
    'music deal analyzer',
    'music contract guide',
  ],
  openGraph: {
    title: 'TrackRights - AI Music Contract Analysis',
    description:
      'Analyze and understand your music contracts with AI. Free, instant, and designed for all music industry professionals.',
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
      'Analyze and understand your music contracts with AI. Free, instant, and designed for all music industry professionals.',
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
            'AI-powered music contract analysis tool for artists, producers, songwriters, managers, and all music industry professionals',
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
            'Live Lawyer - Real-Time AI Consultation',
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

          {/* Features Section */}
          <section aria-labelledby="features-heading">
            <h2 id="features-heading" className="sr-only">
              Our Features
            </h2>
            <Features id="features" />
          </section>

          {/* ComicBanner Section */}
          <section aria-labelledby="comic-heading">
            <h2 id="comic-heading" className="sr-only">
              Why Choose TrackRights
            </h2>
            <ComicBanner />
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
