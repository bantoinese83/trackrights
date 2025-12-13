/**
 * Hero Component
 * Refactored to use new hooks - eliminates prop drilling
 */

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowDownCircle } from 'lucide-react';
import { ContractComparison } from '@/components/ContractComparison';
import { ErrorDisplay } from '@/components/ErrorDisplay';
import { HeroTitle } from '@/components/HeroTitle';
import { FileUpload } from '@/components/FileUpload';
import { ContractRevision } from '@/components/ContractRevision';
import { RevisedContractDisplay } from './RevisedContractDisplay';
import { useAppState } from '@/lib/contexts/StateContext';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';

export default function Hero() {
  const { state, dispatch } = useAppState();
  const { simplifiedContract, revisedContract, error } = state;
  const [hasShownSuccess, setHasShownSuccess] = useState(false);
  const [hasShownReviseSuccess, setHasShownReviseSuccess] = useState(false);
  const { toast } = useToast();

  // Confetti celebration function
  const celebrate = (type: 'analyze' | 'revise') => {
    const duration = 3000;
    const colors =
      type === 'analyze'
        ? ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'] // Purple theme
        : ['#8b5cf6', '#6366f1', '#4f46e5', '#7c3aed']; // Purple/indigo theme

    const end = Date.now() + duration;

    const interval = setInterval(() => {
      if (Date.now() > end) {
        clearInterval(interval);
        return;
      }

      // Launch confetti from multiple positions
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
      });
      confetti({
        particleCount: 5,
        angle: 90,
        spread: 60,
        origin: { x: 0.5, y: 0.5 },
        colors: colors,
      });
    }, 200);

    // Final burst
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: colors,
      });
    }, duration - 500);
  };

  const handleNewAnalysis = () => {
    dispatch({ type: 'RESET_STATE' });
    setHasShownSuccess(false);
    setHasShownReviseSuccess(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Determine if PDF based on original contract content
  // Note: isPdf is now determined in ContractComparison component

  // Track if this is the initial load (to prevent showing toasts on page refresh)
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Mark initial load as complete after first render
  useEffect(() => {
    // Small delay to ensure state is restored from localStorage
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 100);
    return () => {
      clearTimeout(timer);
    };
  }, []);

  // Auto-scroll to results, show success, and celebrate when analysis completes
  useEffect(() => {
    if (simplifiedContract && !hasShownSuccess && !isInitialLoad) {
      // Trigger confetti celebration
      celebrate('analyze');

      toast({
        title: 'Analysis Complete!',
        description:
          'Your contract has been simplified. Scroll down to view results.',
      });
      setHasShownSuccess(true);
      const scrollTimer = setTimeout(() => {
        const element = document.getElementById('contract-results');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 500);

      return () => clearTimeout(scrollTimer);
    } else if (simplifiedContract && isInitialLoad) {
      // On initial load with existing data, just mark as shown without toast/confetti
      setHasShownSuccess(true);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simplifiedContract, hasShownSuccess, isInitialLoad]);

  // Celebrate when revision completes
  useEffect(() => {
    if (revisedContract && !hasShownReviseSuccess && !isInitialLoad) {
      // Trigger confetti celebration
      celebrate('revise');

      toast({
        title: 'Revision Complete!',
        description:
          'Your contract has been revised according to your instructions.',
      });
      setHasShownReviseSuccess(true);
      const scrollTimer = setTimeout(() => {
        const element = document.getElementById('revised-contract');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 500);

      return () => clearTimeout(scrollTimer);
    } else if (revisedContract && isInitialLoad) {
      // On initial load with existing data, just mark as shown without toast/confetti
      setHasShownReviseSuccess(true);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revisedContract, hasShownReviseSuccess, isInitialLoad]);

  return (
    <section className="relative w-full min-h-screen flex flex-col justify-start items-center pt-32 md:pt-40 pb-8 overflow-hidden">
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
            description="Upload your contract, and our AI will break it down in plain language. Perfect for artists, producers, songwriters, managers, and all music industry professionals. No cost, no catch - just clear insights without the legal jargon headaches! Plus, chat with our Live Lawyer AI in real-time to ask questions about your contract."
            className="mt-8"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8"
        >
          <FileUpload />
        </motion.div>

        {error && <ErrorDisplay error={error} />}

        {simplifiedContract && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-8 mb-6 flex justify-center"
          >
            <Button
              onClick={handleNewAnalysis}
              variant="outline"
              className="bg-white/10 hover:bg-white/20 border-white/30 text-white backdrop-blur-sm"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              New Analysis
            </Button>
          </motion.div>
        )}

        {simplifiedContract && (
          <>
            <div id="contract-results" />
            <ContractComparison />
            <ContractRevision />
          </>
        )}

        {revisedContract && <RevisedContractDisplay />}
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
  );
}
