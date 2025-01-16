import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Edit2, ScaleIcon as Scales, CheckCircle } from 'lucide-react';

const steps = [
  { icon: Edit2, text: 'Analyzing revision instructions' },
  { icon: Scales, text: 'Rewriting contract terms' },
  { icon: CheckCircle, text: 'Finalizing producer-friendly revisions' },
];

interface ReviseContractIndicatorProps {
  intervalDuration?: number;
}

export function ReviseContractIndicator({
  intervalDuration = 3000,
}: ReviseContractIndicatorProps) {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prevStep) => (prevStep + 1) % steps.length);
    }, intervalDuration);

    return () => clearInterval(interval);
  }, [intervalDuration]);

  return (
    <motion.div
      className="max-w-md mx-auto text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      aria-live="polite"
    >
      <h3 className="text-lg font-semibold mb-4 text-purple-700">
        Revising Your Contract
      </h3>
      <div className="space-y-4">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            className="flex items-center space-x-3"
            initial={{ opacity: 0.5 }}
            animate={{
              opacity: activeStep === index ? 1 : 0.5,
              scale: activeStep === index ? 1.05 : 1,
            }}
            transition={{ duration: 0.5 }}
            aria-hidden={activeStep !== index}
          >
            <motion.div
              className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center"
              animate={{
                scale: activeStep === index ? [1, 1.2, 1] : 1,
              }}
              transition={{
                repeat: activeStep === index ? Infinity : 0,
                duration: 1,
              }}
            >
              <step.icon className="w-5 h-5 text-indigo-600" />
            </motion.div>
            <span className="text-gray-700">{step.text}</span>
          </motion.div>
        ))}
      </div>
      <motion.div
        className="mt-6 w-full bg-gray-200 rounded-full h-2.5 overflow-hidden"
        initial={{ width: 0 }}
        animate={{ width: '100%' }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="bg-indigo-600 h-2.5 rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{
            duration: 9,
            ease: 'linear',
            repeat: Infinity,
            repeatType: 'loop',
          }}
        />
      </motion.div>
    </motion.div>
  );
}
