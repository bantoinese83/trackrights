import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

interface ErrorDisplayProps {
  error: string;
}

export function ErrorDisplay({ error }: ErrorDisplayProps) {
  return (
    <motion.div
      className="max-w-md mx-auto mt-4 p-4 bg-red-100 text-red-700 rounded-md flex items-center"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
      <div>
        <p className="font-semibold">Error:</p>
        <p>{error}</p>
      </div>
    </motion.div>
  );
}
