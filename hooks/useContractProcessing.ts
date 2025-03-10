
import { useState } from 'react';

export function useContractProcessing() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processContract = async (url: string, payload: {
    originalContract: string;
    instructions: string;
    role: string
  }) => {
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
