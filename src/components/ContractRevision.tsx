/**
 * ContractRevision Component
 * Refactored to use new hooks - eliminates prop drilling
 */

'use client';

import { motion } from 'framer-motion';
import { Edit2, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Loader from '@/components/kokonutui/loader';
import { useContract } from '@/hooks/useContract';
import { useAppState } from '@/lib/contexts/StateContext';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useEffect, useState } from 'react';

// Fallback examples if API fails
const FALLBACK_EXAMPLES = [
  'Increase my royalty percentage from 15% to 25%',
  'Add a clause giving me creative control over my music',
  'Extend the contract term to 3 years with option to renew',
  'Remove the exclusivity clause',
];

export function ContractRevision() {
  const { state } = useAppState();
  const { originalContract } = state;
  const [instructions, setInstructions, clearInstructions] =
    useLocalStorage<string>('trackrights_revision_instructions', '');
  const { reviseContract } = useContract();
  const { handleError } = useErrorHandler();
  const [exampleInstructions, setExampleInstructions] = useState<string[]>(
    FALLBACK_EXAMPLES
  );
  const [isLoadingExamples, setIsLoadingExamples] = useState(false);

  const handleRevise = async () => {
    if (!originalContract || !instructions.trim()) {
      return;
    }

    try {
      const result = await reviseContract.execute({
        originalContract,
        instructions,
        role: 'music-professional',
      });

      if (result && 'revisedContract' in result) {
        // Contract is automatically updated via context
        // Clear instructions after successful revision
        clearInstructions();
      }
    } catch (err) {
      handleError(err, 'Failed to revise contract');
    }
  };

  // Fetch dynamic examples when contract is available
  useEffect(() => {
    const fetchExamples = async () => {
      if (!originalContract || originalContract.trim().length < 50) {
        // Contract too short, use fallback
        setExampleInstructions(FALLBACK_EXAMPLES);
        return;
      }

      setIsLoadingExamples(true);
      try {
        const response = await fetch('/api/generate-examples', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ contractText: originalContract }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.examples && Array.isArray(data.examples) && data.examples.length > 0) {
            setExampleInstructions(data.examples);
          } else {
            setExampleInstructions(FALLBACK_EXAMPLES);
          }
        } else {
          // API error, use fallback
          setExampleInstructions(FALLBACK_EXAMPLES);
        }
      } catch (error) {
        // Network or other error, use fallback
        console.error('Failed to fetch example instructions:', error);
        setExampleInstructions(FALLBACK_EXAMPLES);
      } finally {
        setIsLoadingExamples(false);
      }
    };

    fetchExamples();
  }, [originalContract]);

  const handleExampleClick = (example: string) => {
    if (instructions.trim()) {
      // If there's existing text, append with a separator
      setInstructions(`${instructions}\n\n${example}`);
    } else {
      // If empty, just set it
      setInstructions(example);
    }
    // Scroll textarea into view and focus it
    setTimeout(() => {
      const textarea = document.querySelector('textarea[aria-label="Revision instructions"]') as HTMLTextAreaElement;
      if (textarea) {
        textarea.focus();
        textarea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
  };

  // Show processing indicator only while loading AND before revised contract is available
  // This prevents the indicator from showing after content is already generated
  const isProcessing = reviseContract.loading && !state.revisedContract;
  const error = reviseContract.error?.message;

  return (
    <motion.div
      className="mt-8 p-6 bg-white rounded-lg shadow-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-6">
        <h3 className="text-2xl font-semibold mb-2 text-purple-700">
          Revise Contract
        </h3>
        <p className="mb-4 text-gray-600">
          Tell us how you&apos;d like to improve your contract. Our AI will
          rewrite it based on your instructions.
        </p>
        <div className="mb-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <p className="text-sm font-semibold text-purple-800 mb-3 flex items-center">
            <Lightbulb className="w-4 h-4 mr-2" />
            Example instructions (click to use):
          </p>
          {isLoadingExamples ? (
            <div className="text-sm text-gray-500 italic">
              Generating personalized examples based on your contract...
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {exampleInstructions.map((example, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleClick(example)}
                  className="group relative px-3 py-2 text-sm text-left bg-white hover:bg-purple-100 border border-purple-200 hover:border-purple-400 rounded-md transition-all duration-200 hover:shadow-md cursor-pointer select-text"
                  type="button"
                  title="Click to add this instruction"
                >
                  <span className="text-gray-700 group-hover:text-purple-800">
                    &quot;{example}&quot;
                  </span>
                  <span className="ml-2 text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    +
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="relative">
        <Textarea
          placeholder="Describe the changes you want (e.g., 'Increase royalty to 25%, add creative control clause, remove exclusivity...')"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          className="mb-4"
          rows={5}
          aria-label="Revision instructions"
        />
        {instructions && (
          <div className="absolute bottom-6 right-4 text-xs text-gray-500">
            {instructions.length} characters
          </div>
        )}
      </div>
      <Button
        onClick={handleRevise}
        disabled={isProcessing || !instructions.trim() || !originalContract}
        className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white"
      >
        <span className="flex items-center">
          <Edit2 className="mr-2 h-4 w-4" />
          Revise Contract
        </span>
      </Button>

      {isProcessing && (
        <div className="mt-8">
          <Loader
            title="Revising Your Contract"
            subtitle="Applying your requested changes..."
            size="lg"
          />
        </div>
      )}

      {error && (
        <motion.div
          className="mt-4 p-4 bg-red-100 text-red-700 rounded-md"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
        </motion.div>
      )}
    </motion.div>
  );
}
