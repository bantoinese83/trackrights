'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Sparkles, CheckCircle } from 'lucide-react';

const steps = [
  { icon: FileText, text: 'Analyzing contract details' },
  { icon: Sparkles, text: 'Generating clauses' },
  { icon: CheckCircle, text: 'Finalizing contract' },
];

interface GenerateContractIndicatorProps {
  intervalDuration?: number;
}

export function GenerateContractIndicator({
  intervalDuration = 3000,
}: GenerateContractIndicatorProps) {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prevStep) => (prevStep + 1) % steps.length);
    }, intervalDuration);

    return () => clearInterval(interval);
  }, [intervalDuration]);

  return (
    <div className="max-w-md mx-auto text-center">
      <h3 className="text-xl font-semibold mb-6 text-purple-800">
        Generating Your Contract
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
          >
            <motion.div
              className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center"
              animate={{
                scale: activeStep === index ? [1, 1.2, 1] : 1,
                backgroundColor:
                  activeStep === index
                    ? ['#F3E8FF', '#E9D5FF', '#F3E8FF']
                    : '#F3E8FF',
              }}
              transition={{
                repeat: activeStep === index ? Infinity : 0,
                duration: 2,
              }}
            >
              <step.icon className="w-5 h-5 text-purple-600" />
            </motion.div>
            <span className="text-gray-700">{step.text}</span>
          </motion.div>
        ))}
      </div>
      <div className="mt-6 w-full bg-purple-100 rounded-full h-2 overflow-hidden relative">
        <motion.div
          className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-purple-400 via-purple-600 to-purple-400"
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{
            repeat: Infinity,
            repeatType: 'loop',
            duration: 2,
            ease: 'easeInOut',
          }}
          style={{ width: '50%' }}
        />
        <motion.div
          className="absolute top-0 left-0 right-0 bottom-0 bg-purple-200 opacity-30"
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            repeat: Infinity,
            duration: 1.5,
            ease: 'easeInOut',
          }}
        />
      </div>
    </div>
  );
}
