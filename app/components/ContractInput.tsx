'use client';

  import React from 'react';
  import { Button } from '@/components/ui/button';
  import { Textarea } from '@/components/ui/textarea';
  import { motion } from 'framer-motion';
  import { useToast } from '@/components/ui/use-toast';
  import { useContractForm } from '@/hooks/useContractForm';
  import { useContractProcessing } from '@/hooks/useContractProcessing';

  interface ContractInputProps {
    onContractSubmitAction: (text: string) => void;
  }

  export function ContractInput({ onContractSubmitAction }: ContractInputProps) {
    const { formData, handleInputChange, resetForm } = useContractForm({
      contractText: '',
    });
    const { toast } = useToast();
    const { isProcessing, error, processContract } = useContractProcessing();

    const handleSubmit = async (event: React.FormEvent) => {
      event.preventDefault();

      if (!formData.contractText.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Please enter contract text before submitting.',
          variant: 'destructive',
        });
        return;
      }

      try {
        // First process locally
        await processContract(formData.contractText, {
          analysisType: 'detailed',
          includeRevisions: true
        });

        // Then send to API
        const response = await fetch('/api/simplify-contract', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contractText: formData.contractText
          }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`);
        }

        const data = await response.json();

        // Call the parent handler with both original and simplified text
        onContractSubmitAction(data.simplifiedContract);

        toast({
          title: 'Contract Analyzed',
          description: 'Your contract has been successfully analyzed.',
        });

        resetForm();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to analyze the contract.';

        toast({
          title: 'Analysis Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    };

    return (
      <motion.form
        onSubmit={handleSubmit}
        className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-8 rounded-2xl backdrop-blur-lg bg-purple-900/20 border border-purple-500/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Textarea
          id="contract-text"
          placeholder="Paste your contract text here..."
          value={formData.contractText}
          onChange={(e) => handleInputChange('contractText', e.target.value)}
          className="w-full min-h-[300px] mb-6 p-4 bg-white rounded-xl border-2 border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:ring-opacity-50 placeholder:text-gray-400 text-gray-800 resize-y transition-all duration-200 shadow-inner hover:shadow-md"
          required
        />
        <div className="flex justify-center">
          <Button
            type="submit"
            className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-xl transform transition-all duration-200 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:hover:scale-100"
            disabled={isProcessing || !formData.contractText.trim()}
          >
            {isProcessing ? 'Analyzing...' : 'Analyze Contract'}
          </Button>
        </div>
        {error && (
          <div className="mt-4 text-red-600 text-center" role="alert">
            {error}
          </div>
        )}
      </motion.form>
    );
  }