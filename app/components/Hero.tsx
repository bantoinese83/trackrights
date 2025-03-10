// Hero.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDownCircle } from 'lucide-react';
import { ContractComparison } from '@/app/components/ContractComparison';
import { ErrorDisplay } from '@/app/components/ErrorDisplay';
import { HeroTitle } from '@/app/components/HeroTitle';
import { FileUpload } from '@/app/components/FileUpload';
import { ContractRevision } from '@/app/components/ContractRevision';
import Head from 'next/head';
import { RevisedContractDisplay } from './RevisedContractDisplay';
import { useAppState } from '@/lib/StateContext';

export default function Hero() {
  const { state, dispatch } = useAppState();
  const { originalContract, simplifiedContract, revisedContract, error } =
    state;
  const [isPdf, setIsPdf] = useState<boolean>(false);

  const handleFileProcessed = (
    originalContract: string,
    simplifiedContract: string,
    fileType: string
  ) => {
    dispatch({ type: 'SET_ORIGINAL_CONTRACT', payload: originalContract });
    dispatch({ type: 'SET_SIMPLIFIED_CONTRACT', payload: simplifiedContract });
    dispatch({ type: 'SET_REVISED_CONTRACT', payload: null });
    setIsPdf(fileType === 'application/pdf');
  };

  const handleRevisionComplete = (newRevisedContract: string) => {
    dispatch({ type: 'SET_REVISED_CONTRACT', payload: newRevisedContract });
  };

  const dynamicOgImage = simplifiedContract
    ? `/api/og?title=${encodeURIComponent('Contract Analysis Complete')}`
    : '/default-og-image.jpg';

  return (
    <>
      <Head>
        <meta property="og:image" content={dynamicOgImage} />
        <meta name="twitter:image" content={dynamicOgImage} />
      </Head>
      <section className="relative w-full min-h-screen flex flex-col justify-start items-center pt-52 pb-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 opacity-95" />
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('/music-notes-pattern.svg')] opacity-10 bg-repeat" />
        </div>

        <div className="container px-4 md:px-6 mx-auto max-w-7xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <HeroTitle
              title="Decode Your Music Contracts with AI - 100% Free"
              description="Upload your contract, and our AI will break it down in producer-friendly terms. No cost, no catch - just clear insights without the legal jargon headaches!"
              className="mt-8"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8"
          >
            <FileUpload onFileProcessedAction={handleFileProcessed} />
          </motion.div>

          {error && <ErrorDisplay error={error} />}

          {simplifiedContract && (
            <>
              <ContractComparison
                originalText={
                  originalContract || 'Original contract text not available'
                }
                simplifiedContract={simplifiedContract}
                isPdf={isPdf}
              />
              <ContractRevision
                originalContract={originalContract || ''}
                onRevisionCompleteAction={handleRevisionComplete}
              />
            </>
          )}

          {revisedContract && (
            <RevisedContractDisplay revisedContract={revisedContract} />
          )}
        </div>

        <motion.div
          className="absolute bottom-8 left-0 right-0 flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <a
            href="#features"
            className="flex flex-col items-center text-white hover:text-purple-300 transition-colors duration-300"
          >
            <span className="mb-2 text-sm md:text-base">Learn More</span>
            <ArrowDownCircle className="animate-bounce" aria-hidden="true" />
          </a>
        </motion.div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 320"
            className="w-full h-auto"
          >
            <path
              fill="#ffffff"
              fillOpacity="1"
              d="M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,224C672,213,768,171,864,149.3C960,128,1056,128,1152,149.3C1248,171,1344,213,1392,234.7L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            ></path>
          </svg>
        </div>
      </section>
    </>
  );
}
