'use client';

import React, {
  useState,
  useEffect,
  useMemo,
  lazy,
  Suspense,
  useRef,
} from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Loader from '@/components/kokonutui/loader';
import { useAppState } from '@/lib/contexts/StateContext';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Diamond, Copy, Download, Check } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { LiveLawyerWidget } from '@/components/LiveLawyerWidget';

const PDFViewer = lazy(() => import('./PDFViewer'));

const ContractRatingPlaque = ({ rating }: { rating: string }) => {
  const getRatingImage = (rating: string) => {
    switch (rating.toLowerCase()) {
      case 'platinum':
        return 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-01-15%20at%204.37.44%E2%80%AFPM-u3RJqMtrGUe6p7FVIDCCUR9WhTFYUP.png';
      case 'gold':
        return 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-01-15%20at%204.37.34%E2%80%AFPM-AL61x2Ar4TabESWX0sVeUDVKnJvWq4.png';
      case 'wood':
        return 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-01-15%20at%204.37.27%E2%80%AFPM-qI72DM5pc0SXZCPN1LGK8tol1CgX8o.png';
      case 'diamond':
        return 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-01-15%20at%204.37.50%E2%80%AFPM-yoMScIahTbQjx2g81rm7e9v4WDLC5w.png';
      default:
        return 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-01-15%20at%204.37.44%E2%80%AFPM-u3RJqMtrGUe6p7FVIDCCUR9WhTFYUP.png';
    }
  };

  return (
    <div className="flex flex-col items-center mb-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="relative w-40 h-40 mb-2 rounded-lg"
      >
        <Image
          src={getRatingImage(rating) || '/placeholder.svg'}
          alt={`${rating} Rating`}
          fill
          sizes="160px"
          className="object-contain rounded-lg"
        />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col items-center"
      >
        <div
          className="text-2xl font-extrabold text-yellow-400 tracking-wider"
          style={{ fontFamily: "'Engraver', serif" }}
        >
          {rating.toUpperCase()}
        </div>
        <div
          className="text-lg font-semibold text-white tracking-wide"
          style={{ fontFamily: "'Trajan Pro', serif" }}
        >
          PLAQUE
        </div>
      </motion.div>
    </div>
  );
};

const MemoizedContractRatingPlaque = React.memo(ContractRatingPlaque);

export function ContractComparison() {
  const { state } = useAppState();
  const { originalContract, simplifiedContract } = state;

  // Determine if PDF based on original contract content
  const isPdf = useMemo(() => {
    if (!originalContract) return false;
    // Check if it's base64 encoded (PDF indicator)
    return (
      originalContract.startsWith('data:') ||
      /^[A-Za-z0-9+/=]+$/.test(originalContract.substring(0, 100))
    );
  }, [originalContract]);

  const originalText =
    originalContract || 'Original contract text not available';

  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const contractRating = useMemo(() => {
    if (simplifiedContract) {
      const ratingMatch =
        simplifiedContract.match(
          /Contract Rating:\s*(WOOD|GOLD|PLATINUM|DIAMOND)/i
        ) ||
        originalText.match(/Contract Rating:\s*(WOOD|GOLD|PLATINUM|DIAMOND)/i);
      return ratingMatch?.[1]?.toLowerCase() ?? 'wood';
    }
    return 'wood';
  }, [simplifiedContract, originalText]);

  useEffect(() => {
    if (originalText && simplifiedContract) {
      setIsLoading(false);
    }
  }, [originalText, simplifiedContract]);

  const handleCopy = async () => {
    if (!simplifiedContract) return;
    try {
      await navigator.clipboard.writeText(simplifiedContract);
      setCopied(true);
      toast({
        title: 'Copied!',
        description: 'Simplified contract copied to clipboard',
      });
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: 'Copy failed',
        description: 'Failed to copy to clipboard',
        variant: 'destructive',
      });
    }
  };

  const handleDownload = () => {
    if (!simplifiedContract) return;
    const blob = new Blob([simplifiedContract], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `simplified-contract-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: 'Downloaded!',
      description: 'Contract saved to your downloads',
    });
  };

  if (isLoading) {
    return (
      <div className="text-center mt-8">
        <Loader
          title="Loading Contract Comparison"
          subtitle="Preparing your analysis..."
          size="lg"
        />
      </div>
    );
  }

  if (!originalText || !simplifiedContract) {
    return (
      <div className="text-center mt-8">
        <p className="text-red-700">Error: Missing contract text.</p>
      </div>
    );
  }

  return (
    <motion.div
      className="w-full max-w-full sm:max-w-6xl mx-auto mt-4 sm:mt-8 px-4 sm:px-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      aria-live="polite"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
      >
        <MemoizedContractRatingPlaque rating={contractRating} />
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
        <div className="mb-8 md:mb-0">
          <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4 text-white p-4 rounded-t-lg flex items-center shadow-lg rounded-lg">
            <Diamond className="w-5 h-5 mr-2 animate-pulse" />
            Original Contract
          </h2>
          <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-md h-[400px] sm:h-[500px] md:h-[600px] overflow-y-auto">
            {isPdf ? (
              <Suspense
                fallback={<Skeleton className="h-[600px] w-full rounded-lg" />}
              >
                <PDFViewer pdfData={originalText} />
              </Suspense>
            ) : (
              <div className="prose max-w-none text-gray-700 whitespace-pre-line text-sm sm:text-base rounded-lg">
                {originalText}
              </div>
            )}
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2 sm:mb-4 text-white p-4 rounded-t-lg shadow-lg rounded-lg">
            <h2 className="text-lg sm:text-xl font-semibold flex items-center">
              <Diamond className="w-5 h-5 mr-2 animate-pulse" />
              Simplified Version
            </h2>
            <TooltipProvider>
              <div className="flex gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleCopy}
                      size="sm"
                      variant="outline"
                      className="bg-white/10 hover:bg-white/20 border-white/30 text-white h-8 px-3"
                    >
                      {copied ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{copied ? 'Copied!' : 'Copy to clipboard'}</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleDownload}
                      size="sm"
                      variant="outline"
                      className="bg-white/10 hover:bg-white/20 border-white/30 text-white h-8 px-3"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Download as markdown</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </div>
          <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-md h-[400px] sm:h-[500px] md:h-[600px] overflow-y-auto">
            <ReactMarkdown
              className="prose max-w-none text-xs sm:text-sm md:text-base simplified-contract rounded-lg"
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
            >
              {simplifiedContract}
            </ReactMarkdown>
          </div>
        </div>
      </div>
      <style jsx>{``}</style>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&display=swap');

        @font-face {
          font-family: 'Engraver';
          src: url('https://fonts.cdnfonts.com/css/engravers-mt')
            format('woff2');
        }

        @font-face {
          font-family: 'Trajan Pro';
          src: url('https://fonts.cdnfonts.com/css/trajan-pro') format('woff2');
        }
      `}</style>

      {/* Live Lawyer Widget */}
      <LiveLawyerWidget />
    </motion.div>
  );
}
