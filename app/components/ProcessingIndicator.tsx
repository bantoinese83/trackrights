import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Scale, FileText, CheckCircle, Diamond } from 'lucide-react';
import { ReviseContractIndicator } from './ReviseContractIndicator';

const simplifySteps = [
  { icon: FileText, text: 'Reviewing contract terms' },
  { icon: Scale, text: 'Analyzing legal implications' },
  { icon: CheckCircle, text: 'Preparing simplified summary' },
];

interface ProcessingIndicatorProps {
  intervalDuration?: number;
  type?: 'simplify' | 'revise';
}

export function ProcessingIndicator({
  intervalDuration = 3000,
  type = 'simplify',
}: ProcessingIndicatorProps) {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prevStep) => (prevStep + 1) % simplifySteps.length);
    }, intervalDuration);

    return () => clearInterval(interval);
  }, [intervalDuration]);

  if (type === 'revise') {
    return <ReviseContractIndicator intervalDuration={intervalDuration} />;
  }

  return (
    <motion.div
      className="max-w-md mx-auto text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      aria-live="polite"
    >
      <h3 className="text-xl font-semibold mb-6 text-white p-4 rounded-full shadow-lg flex items-center justify-center">
        <Diamond className="w-6 h-6 mr-2 text-purple-200 animate-pulse" />
        Our AI Legal Team is Analyzing Your Contract
      </h3>
      <div className="space-y-4">
        {simplifySteps.map((step, index) => (
          <motion.div
            key={index}
            className="flex items-center space-x-3 p-3 rounded-lg backdrop-blur-md bg-purple-900/80 border border-purple-500/20 shadow-lg"
            initial={{ opacity: 0.5 }}
            animate={{
              opacity: activeStep === index ? 1 : 0.5,
              scale: activeStep === index ? 1.05 : 1,
            }}
            transition={{ duration: 0.5 }}
            aria-hidden={activeStep !== index}
          >
            <motion.div
              className="flex-shrink-0 w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center border-2 border-purple-300/50 shadow-lg"
              animate={{
                scale: activeStep === index ? [1, 1.2, 1] : 1,
                borderColor:
                  activeStep === index
                    ? [
                        'rgba(167, 139, 250, 0.7)',
                        'rgba(167, 139, 250, 1)',
                        'rgba(167, 139, 250, 0.7)',
                      ]
                    : 'rgba(167, 139, 250, 0.7)',
              }}
              transition={{
                repeat: activeStep === index ? Infinity : 0,
                duration: 2,
              }}
            >
              <step.icon className="w-5 h-5 text-purple-200" />
            </motion.div>
            <span className="text-white text-base font-medium tracking-wide">
              {step.text}
            </span>
          </motion.div>
        ))}
      </div>
      <div className="mt-6 w-full bg-purple-200 rounded-full h-2 overflow-hidden relative">
        <motion.div
          className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-purple-500 via-purple-600 to-purple-500"
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
          className="absolute top-0 left-0 right-0 bottom-0 bg-purple-300 opacity-30"
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
    </motion.div>
  );
}
