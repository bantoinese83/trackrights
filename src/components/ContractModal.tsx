'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Copy, Clipboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Loader from '@/components/kokonutui/loader';
import { Skeleton } from '@/components/ui/skeleton';
import { ContractForm } from './ContractForm';
import { useModal } from '@/lib/contexts/ModalContext';
import confetti from 'canvas-confetti';

const escapeHtml = (unsafe: string) => {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const cleanContractText = (text: string): string => {
  return text
    .replace(/\*\*?(.*?)\*\*?/g, '$1') // Remove bold and italic markdown
    .replace(/`/g, '') // Remove backticks
    .replace(/^#+\s*/gm, '') // Remove markdown headers
    .replace(/\n{3,}/g, '\n\n'); // Replace multiple newlines with double newlines
};

export function ContractModal() {
  const { modalState, closeModal } = useModal();
  const contract = modalState.selectedContract;
  const [generatedContract, setGeneratedContract] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const { toast } = useToast();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Confetti celebration function
  const celebrate = () => {
    const duration = 3000;
    const colors = ['#8b5cf6', '#6366f1', '#4f46e5', '#7c3aed', '#a78bfa'];

    const end = Date.now() + duration;

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      if (Date.now() > end) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
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
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: colors,
      });
      timeoutRef.current = null;
    }, duration - 500);
  };

  const handleGenerateContract = async (formData: Record<string, string>) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/generate-contract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contractDetails: contract || {},
          contractInputs: formData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate contract');
      }

      const data = await response.json();
      const cleanedContract = cleanContractText(data.generatedContract);
      setGeneratedContract(cleanedContract);

      // Trigger confetti celebration
      celebrate();

      toast({
        title: '✨ Contract Generated!',
        description: 'Your contract has been successfully generated.',
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate the contract. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = useCallback(() => {
    if (generatedContract) {
      navigator.clipboard
        .writeText(generatedContract)
        .then(() => {
          setCopySuccess(true);
          toast({
            title: 'Copied to Clipboard',
            description: 'The contract has been copied to your clipboard.',
          });
          if (copyTimeoutRef.current) {
            clearTimeout(copyTimeoutRef.current);
          }
          copyTimeoutRef.current = setTimeout(() => {
            setCopySuccess(false);
            copyTimeoutRef.current = null;
          }, 2000);
        })
        .catch((err) => {
          console.error('Failed to copy text: ', err);
          toast({
            title: 'Copy Failed',
            description: 'Failed to copy the contract. Please try again.',
            variant: 'destructive',
          });
        });
    }
  }, [generatedContract, toast]);

  if (!contract) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-purple-800">
            {contract?.title}
          </h2>
          <Button variant="ghost" size="icon" onClick={closeModal}>
            <X className="h-6 w-6" />
          </Button>
        </div>
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Description:</h3>
          <p className="text-gray-700">{contract.description}</p>
        </div>
        {!generatedContract ? (
          <ContractForm
            contractId={contract.id}
            onSubmit={handleGenerateContract}
          />
        ) : (
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">Generated Contract:</h3>
              <AnimatePresence mode="wait">
                <motion.div
                  key={copySuccess ? 'success' : 'copy'}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    onClick={copyToClipboard}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2"
                    disabled={!generatedContract || isLoading}
                    aria-label="Copy contract to clipboard"
                  >
                    {copySuccess ? (
                      <>
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{
                            type: 'spring',
                            stiffness: 500,
                            damping: 15,
                          }}
                        >
                          <Check className="w-4 h-4 text-green-500" />
                        </motion.div>
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <motion.div
                          animate={{ rotate: [0, 360] }}
                          transition={{
                            duration: 0.5,
                            repeat: Infinity,
                            repeatDelay: 5,
                          }}
                        >
                          <Copy className="w-4 h-4" />
                        </motion.div>
                        <span>Copy to Clipboard</span>
                      </>
                    )}
                  </Button>
                </motion.div>
              </AnimatePresence>
            </div>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : (
              <pre
                className="bg-gray-100 p-4 rounded-md overflow-x-auto whitespace-pre-wrap text-sm text-gray-800 border border-gray-300"
                dangerouslySetInnerHTML={{
                  __html: escapeHtml(generatedContract || ''),
                }}
              />
            )}
          </div>
        )}
        {isLoading && (
          <div className="mt-8">
            <Loader
              title="Generating Your Contract"
              subtitle="This may take 30-60 seconds"
              size="lg"
            />
          </div>
        )}
        <motion.div
          className="absolute top-2 right-2"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: copySuccess ? 1 : 0, scale: copySuccess ? 1 : 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          <motion.div
            animate={{
              y: [0, -10, 0],
              rotate: [0, -5, 5, -5, 0],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          >
            <Clipboard className="w-6 h-6 text-purple-500" />
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
