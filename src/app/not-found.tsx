import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-center">
      <p className="text-sm font-medium uppercase tracking-wide text-purple-400 mb-2">
        404
      </p>
      <h1 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
        This page is not available
      </h1>
      <div className="max-w-lg text-slate-300 text-base leading-relaxed space-y-4 mb-8">
        <p>
          TrackRights is an AI-powered assistant for music and creator
          contracts. You may have followed an old link, or the page may have
          moved.
        </p>
        <p>
          From the home page you can upload a contract for analysis, explore
          templates, use the royalty calculator, and read answers to common
          questions about music industry agreements.
        </p>
      </div>
      <Link
        href="/"
        className="inline-flex items-center justify-center rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-purple-500 transition-colors"
      >
        Go to TrackRights home
      </Link>
    </div>
  );
}
