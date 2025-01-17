'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';

interface ContractInputProps {
  onContractSubmitAction: (text: string) => void;
}

interface ContractText {
  contractText: string;
}

export function ContractInput({ onContractSubmitAction }: ContractInputProps) {
  const [contractText, setContractText] = useState<ContractText['contractText']>('');
  const { toast } = useToast();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (contractText.trim()) {
      onContractSubmitAction(contractText);
      toast({
        title: 'Contract Submitted',
        description: 'Your contract text has been successfully submitted.',
      });
    } else {
      toast({
        title: 'Validation Error',
        description: 'Please enter contract text before submitting.',
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
        value={contractText}
        onChange={(e) => setContractText(e.target.value)}
        className="w-full min-h-[300px] mb-6 p-4 bg-white rounded-xl border-2 border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:ring-opacity-50 placeholder:text-gray-400 text-gray-800 resize-y transition-all duration-200 shadow-inner hover:shadow-md"
        required
      />
      <div className="flex justify-center">
        <Button
          type="submit"
          className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-xl transform transition-all duration-200 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:hover:scale-100"
          disabled={!contractText.trim()}
        >
          Analyze Contract
        </Button>
      </div>
    </motion.form>
  );
}
