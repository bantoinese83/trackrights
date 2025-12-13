/**
 * ContractInput Component
 * Refactored to use new hooks - no prop drilling
 */

'use client';

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useContractForm } from '@/hooks/useContractForm';
import { useContract } from '@/hooks/useContract';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useAppState } from '@/lib/contexts/StateContext';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import Loader from '@/components/kokonutui/loader';

export function ContractInput() {
  const [draftText, setDraftText, clearDraft] = useLocalStorage<string>(
    'trackrights_contract_draft',
    ''
  );
  const { formData, handleInputChange, resetForm, validateForm } =
    useContractForm({
      contractText: draftText,
    });

  // Sync form data with localStorage draft (debounced)
  useEffect(() => {
    const currentText = formData['contractText'] ?? '';
    if (currentText) {
      const timeoutId = setTimeout(() => {
        setDraftText(currentText);
      }, 500); // Debounce to avoid too many writes
      return () => clearTimeout(timeoutId);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData['contractText'], setDraftText]);
  const { toast } = useToast();
  const { simplifyContract } = useContract();
  const { handleError } = useErrorHandler();
  const { state, dispatch } = useAppState();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter contract text before submitting.',
        variant: 'destructive',
      });
      return;
    }

    const contractText = formData['contractText'];
    if (!contractText || !contractText.trim()) {
      return;
    }

    // Clear previous results before starting new analysis
    dispatch({ type: 'SET_SIMPLIFIED_CONTRACT', payload: '' });
    dispatch({ type: 'SET_REVISED_CONTRACT', payload: null });

    try {
      const result = await simplifyContract.execute({ contractText });
      if (result) {
        toast({
          title: '✅ Analysis Started!',
          description:
            'Your contract is being analyzed. Results will appear shortly.',
        });
        resetForm();
        clearDraft(); // Clear draft after successful submission
      }
    } catch (err) {
      handleError(err, 'Failed to submit the contract');
    }
  };

  // Keyboard shortcut: Ctrl/Cmd + Enter to submit
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
    }
  };

  const contractText = formData['contractText'] ?? '';
  // Show processing state only while loading AND before simplified contract is available
  const isProcessing = simplifyContract.loading && !state.simplifiedContract;
  const hasError = simplifyContract.error !== null;

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 rounded-xl backdrop-blur-lg bg-white/10 border border-white/20 shadow-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative mb-2">
        <Textarea
          id="contract-text"
          placeholder="Paste your contract text here... (Press Ctrl/Cmd + Enter to submit)"
          value={contractText}
          onChange={(e) => handleInputChange('contractText', e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full min-h-[300px] mb-6 p-4 bg-white/95 rounded-lg border-2 border-white/30 focus:border-purple-400 focus:ring-2 focus:ring-purple-300/50 placeholder:text-gray-400 text-gray-800 resize-y transition-all duration-200 shadow-lg"
          required
          aria-invalid={hasError}
          aria-describedby={hasError ? 'contract-error' : undefined}
        />
        {contractText && (
          <div className="absolute bottom-8 right-4 text-xs text-gray-500 bg-white/80 px-2 py-1 rounded">
            {contractText.length.toLocaleString()} characters
          </div>
        )}
      </div>
      {!isProcessing && (
        <div className="flex justify-center">
          <Button
            type="submit"
            className="w-full sm:w-auto bg-white text-purple-900 hover:bg-purple-50 font-semibold py-3 px-8 rounded-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:hover:scale-100 shadow-lg"
            disabled={!contractText.trim()}
          >
            <span className="mr-2">✨</span>
            Analyze Contract
          </Button>
        </div>
      )}
      {isProcessing && (
        <div className="mt-8">
          <Loader
            title="AI Legal Team Analyzing"
            subtitle="This may take 30-60 seconds"
            size="lg"
          />
        </div>
      )}
      {hasError && (
        <div id="contract-error" className="mt-4 text-red-600 text-center">
          {simplifyContract.error?.message ?? 'An error occurred'}
        </div>
      )}
    </motion.form>
  );
}
