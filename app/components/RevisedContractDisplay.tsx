import { motion } from 'framer-motion';

interface RevisedContractDisplayProps {
  revisedContract: string | null;
}

export function RevisedContractDisplay({
  revisedContract,
}: RevisedContractDisplayProps) {
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
