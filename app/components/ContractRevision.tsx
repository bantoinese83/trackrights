'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ProcessingIndicator } from './ProcessingIndicator';
import { useContractProcessing } from '@/hooks/useContractProcessing';

interface ContractRevisionProps {
  originalContract: string;
  onRevisionCompleteAction: (revisedContract: string) => void;
}

export function ContractRevision({
  originalContract,
  onRevisionCompleteAction,
}: ContractRevisionProps) {
  const [instructions, setInstructions] = useState('');
  const { isProcessing, error, processContract } = useContractProcessing();

  const handleRevise = async () => {
    try {
      const data = await processContract('/api/revise-contract', {
        originalContract,
        instructions,
        role: 'music-professional',
      });

      const revisedContract = data.revisedContract.replace(/\*\*?|```/g, '');

      onRevisionCompleteAction(revisedContract);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <motion.div
      className="mt-8 p-6 bg-white rounded-lg shadow-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-2xl font-semibold mb-4 text-purple-700">
        Revise Contract in Favor of Producer
      </h3>
      <p className="mb-4 text-gray-600">
        Provide instructions for how you&#39;d like the contract to be revised.
        Our AI will attempt to rewrite the contract in favor of the producer
        based on your input.
      </p>
      <Textarea
        placeholder="E.g., Increase royalty percentage, add clause for creative control, extend contract duration..."
        value={instructions}
        onChange={(e) => setInstructions(e.target.value)}
        className="mb-4"
        rows={4}
      />
      <Button
        onClick={handleRevise}
        disabled={isProcessing || !instructions.trim()}
        className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white"
      >
        {isProcessing ? (
          <span className="flex items-center">
            <Edit2 className="mr-2 h-4 w-4 animate-spin" />
            Revising...
          </span>
        ) : (
          <span className="flex items-center">
            <Edit2 className="mr-2 h-4 w-4" />
            Revise Contract
          </span>
        )}
      </Button>

      {isProcessing && <ProcessingIndicator type="revise" />}

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
