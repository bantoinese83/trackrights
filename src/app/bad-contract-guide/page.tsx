'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { AlertTriangle, Scale } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import {
  badClauses,
  badContractGuideMeta,
  fairContractPoints,
  legalDisclaimer,
  redFlagSummary,
} from '@/data/bad-contract-guide';

export default function BadContractGuidePage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-purple-900 via-indigo-900 to-blue-900">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12 max-w-4xl">
        <article>
          <motion.header
            className="text-center mb-12"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <p className="text-sm font-medium uppercase tracking-widest text-purple-200/90 mb-3">
              Education — not legal advice
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 text-balance">
              {badContractGuideMeta.title}
            </h1>
            <p className="text-lg text-purple-100/95 max-w-2xl mx-auto text-pretty">
              {badContractGuideMeta.subtitle}
            </p>
          </motion.header>

          <div className="rounded-xl border border-amber-400/30 bg-amber-950/25 backdrop-blur-sm p-4 sm:p-5 mb-12 flex gap-3">
            <AlertTriangle
              className="w-6 h-6 shrink-0 text-amber-300 mt-0.5"
              aria-hidden="true"
            />
            <p className="text-sm sm:text-base text-amber-50/95 m-0 leading-relaxed">
              The examples below illustrate{' '}
              <strong className="font-semibold">what not to sign</strong>{' '}
              without negotiation and lawyer review. Real agreements vary;
              wording alone does not tell the whole story.
            </p>
          </div>

          <section
            aria-labelledby="example-clauses-heading"
            className="space-y-6 mb-16"
          >
            <h2
              id="example-clauses-heading"
              className="text-2xl font-semibold text-white"
            >
              Example clauses to watch for
            </h2>
            <div className="space-y-5">
              {badClauses.map((clause, index) => (
                <motion.section
                  key={clause.id}
                  id={clause.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.03 }}
                  className="rounded-xl border border-purple-300/20 bg-white/5 backdrop-blur-sm overflow-hidden"
                  aria-labelledby={`${clause.id}-title`}
                >
                  <div className="px-4 sm:px-5 py-4 border-b border-purple-400/15 bg-purple-950/40">
                    <h3
                      id={`${clause.id}-title`}
                      className="text-base sm:text-lg font-semibold text-white m-0"
                    >
                      {clause.sectionTitle}
                    </h3>
                  </div>
                  <div className="px-4 sm:px-5 py-4 space-y-4">
                    <blockquote className="m-0 pl-4 border-l-2 border-purple-300/50 text-purple-100/95 text-sm sm:text-base leading-relaxed italic">
                      {clause.quote}
                    </blockquote>
                    <p className="text-sm sm:text-base text-purple-200/95 m-0 leading-relaxed">
                      <span className="font-medium text-rose-200/95">
                        Why it matters:
                      </span>{' '}
                      {clause.whyBad}
                    </p>
                  </div>
                </motion.section>
              ))}
            </div>
          </section>

          <section aria-labelledby="summary-heading" className="mb-16">
            <h2
              id="summary-heading"
              className="text-2xl font-semibold text-white mb-4"
            >
              Red flag summary
            </h2>
            <div className="overflow-x-auto rounded-xl border border-purple-300/20 bg-white/5 backdrop-blur-sm">
              <table className="w-full min-w-[520px] text-left text-sm sm:text-base">
                <caption className="sr-only">
                  Common clause types and why they can be risky
                </caption>
                <thead>
                  <tr className="border-b border-purple-400/20 bg-purple-950/50">
                    <th
                      scope="col"
                      className="px-4 py-3 font-semibold text-white"
                    >
                      Clause type
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 font-semibold text-white"
                    >
                      Risk in plain terms
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {redFlagSummary.map((row, i) => (
                    <tr
                      key={i}
                      className="border-b border-purple-400/10 last:border-0 hover:bg-white/5"
                    >
                      <td className="px-4 py-3 text-purple-100 align-top">
                        {row.clause}
                      </td>
                      <td className="px-4 py-3 text-purple-200/95 align-top">
                        {row.redFlag}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section aria-labelledby="fair-heading" className="mb-16">
            <div className="flex items-start gap-3 mb-4">
              <Scale
                className="w-7 h-7 shrink-0 text-emerald-300 mt-0.5"
                aria-hidden="true"
              />
              <h2
                id="fair-heading"
                className="text-2xl font-semibold text-white m-0"
              >
                What fairer deals often include
              </h2>
            </div>
            <ul className="list-none m-0 pl-0 space-y-3 text-purple-100/95">
              {fairContractPoints.map((point) => (
                <li key={point} className="flex gap-3">
                  <span
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400/90"
                    aria-hidden
                  />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </section>

          <footer className="rounded-xl border border-purple-300/25 bg-purple-950/45 p-5 sm:p-6 space-y-4">
            <p className="text-sm sm:text-base text-purple-100/95 m-0 leading-relaxed">
              {legalDisclaimer}
            </p>
            <p className="text-sm m-0">
              <Link
                href="/faq"
                className="text-purple-200 underline underline-offset-4 hover:text-white transition-colors"
              >
                FAQ
              </Link>
              <span className="text-purple-300/80 mx-2" aria-hidden="true">
                ·
              </span>
              <Link
                href="/"
                className="text-purple-200 underline underline-offset-4 hover:text-white transition-colors"
              >
                Analyze a contract
              </Link>
            </p>
          </footer>
        </article>
      </main>
      <Footer />
    </div>
  );
}
