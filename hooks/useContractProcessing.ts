import { useState } from 'react';
import { simplifyContract } from '../app/api/simplify-contract/route';

export function useContractProcessing() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processSimplifyContract = async (contractText: string) => {
    setIsProcessing(true);
    setError(null);

    try {
      const simplifiedContract = await simplifyContract({ contractText });
      return simplifiedContract;
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred');
      }
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const processContract = async (url: string, payload: any) => {
    if (url === '/api/simplify-contract') {
      return processSimplifyContract(payload.contractText);
    }

    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process the contract');
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred');
      }
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    error,
    processContract,
  };
}
