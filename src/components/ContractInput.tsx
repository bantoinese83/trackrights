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
import { Wand2 } from 'lucide-react';

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
          title: 'Analysis Started!',
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
      className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 rounded-2xl backdrop-blur-lg bg-card/40 border border-border shadow-2xl"
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
          className="w-full min-h-[300px] mb-6 p-4 bg-card/60 backdrop-blur-sm rounded-xl border-2 border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground text-foreground resize-y transition-all duration-300 shadow-inner text-base"
          required
          aria-invalid={hasError}
          aria-describedby={hasError ? 'contract-error' : undefined}
        />
        {contractText && (
          <div className="absolute bottom-8 right-4 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-2 py-1 rounded-md border border-border/50">
            {contractText.length.toLocaleString()} characters
          </div>
        )}
      </div>
      {!isProcessing && (
        <div className="flex justify-center">
          <Button
            type="submit"
            size="lg"
            className="w-full sm:w-auto font-semibold py-6 px-10 rounded-full transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/25 disabled:opacity-50 disabled:hover:scale-100 text-base"
            disabled={!contractText.trim()}
          >
            <Wand2 className="w-5 h-5 mr-2" />
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
