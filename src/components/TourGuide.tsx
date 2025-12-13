'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTour } from '@/lib/contexts/TourContext';

const steps = [
  {
    title: 'Welcome to TrackRights',
    content:
      "Let's walk you through how to use our AI-powered contract analysis tool.",
  },
  {
    title: 'Step 1: Upload Your Contract',
    content:
      "Click on 'Choose File' or drag and drop your music contract in PDF or text format.",
  },
  {
    title: 'Step 2: AI Analysis',
    content:
      'Our AI will analyze your contract and break it down into simple terms.',
  },
  {
    title: 'Step 3: Review Simplified Contract',
    content:
      'Read through the simplified version of your contract, with key points highlighted.',
  },
  {
    title: 'Step 4: Get Revision Suggestions',
    content:
      'If needed, use our AI to suggest revisions that are more favorable to you.',
  },
  {
    title: "You're All Set!",
    content:
      'You now have a clear understanding of your contract. Make informed decisions with confidence!',
  },
];

export function TourGuide() {
  const { isTourOpen, closeTour } = useTour();
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      closeTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <AnimatePresence>
      {isTourOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 max-w-md w-full"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-purple-800">
                {steps[currentStep]?.title ?? ''}
              </h2>
              <Button variant="ghost" size="icon" onClick={closeTour}>
                <X className="h-6 w-6" />
              </Button>
            </div>
            <p className="text-gray-600 mb-6">
              {steps[currentStep]?.content ?? ''}
            </p>
            <div className="flex justify-between">
              <Button
                onClick={prevStep}
                disabled={currentStep === 0}
                variant="outline"
              >
                Previous
              </Button>
              <Button onClick={nextStep}>
                {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
