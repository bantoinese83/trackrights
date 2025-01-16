import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface RevisedContractDisplayProps {
  revisedContract: string | null;
}

export function RevisedContractDisplay({
  revisedContract,
}: RevisedContractDisplayProps) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!revisedContract) {
      setError('Failed to load the revised contract.');
    } else {
      setError(null);
    }
  }, [revisedContract]);

  if (error) {
    return (
      <motion.div
        className="mt-8 bg-red-100 p-4 rounded-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-xl md:text-2xl font-semibold mb-4 text-red-800">
          Error
        </h3>
        <p className="text-red-700">{error}</p>
      </motion.div>
    );
  }

  if (!revisedContract) return null;

  return (
    <motion.div
      className="mt-8 bg-white"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-xl md:text-2xl font-semibold mb-4 text-purple-800">
        Revised Contract
      </h3>
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
        <pre className="whitespace-pre-wrap text-sm text-gray-800">
          {revisedContract}
        </pre>
      </div>
    </motion.div>
  );
}
