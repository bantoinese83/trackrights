'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTour } from '@/lib/contexts/TourContext';

interface TourStep {
  title: string;
  content: string;
  targetElement?: string; // Optional: CSS selector for element to highlight
}

const steps: TourStep[] = [
  {
    title: 'Welcome to TrackRights',
    content:
      "Let's walk you through how to use our AI-powered contract analysis tool. You can navigate with arrow keys or click the buttons.",
  },
  {
    title: 'Step 1: Upload Your Contract',
    content:
      "Click on 'Choose File' or drag and drop your music contract in PDF or text format. Our system supports most common document formats.",
  },
  {
    title: 'Step 2: AI Analysis',
    content:
      'Our AI will analyze your contract and break it down into simple terms. This process typically takes just a few seconds.',
  },
  {
    title: 'Step 3: Review Simplified Contract',
    content:
      'Read through the simplified version of your contract, with key points highlighted. Important terms are explained in plain language.',
  },
  {
    title: 'Step 4: Get Revision Suggestions',
    content:
      'If needed, use our AI to suggest revisions that are more favorable to you. Get actionable recommendations for contract improvements.',
  },
  {
    title: "You're All Set!",
    content:
      'You now have a clear understanding of your contract. Make informed decisions with confidence! Ready to get started?',
  },
];

export function TourGuide() {
  const { isTourOpen, closeTour, completeTour } = useTour();
  const [currentStep, setCurrentStep] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Save focus when tour opens and restore when it closes
  useEffect(() => {
    if (isTourOpen) {
      previousFocusRef.current =
        (document.activeElement as HTMLElement) || null;
      // Focus the modal when it opens
      setTimeout(() => {
        modalRef.current?.focus();
      }, 100);
    } else {
      // Restore focus when tour closes
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    }
  }, [isTourOpen]);

  const handleFinish = useCallback(() => {
    completeTour();
  }, [completeTour]);

  const handleSkip = useCallback(() => {
    closeTour();
  }, [closeTour]);

  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleFinish();
    }
  }, [currentStep, handleFinish]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback((stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStep(stepIndex);
    }
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!isTourOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          handleSkip();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          prevStep();
          break;
        case 'ArrowRight':
        case 'Enter':
          e.preventDefault();
          nextStep();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTourOpen, handleSkip, prevStep, nextStep]);

  // Focus trap: keep focus within modal
  useEffect(() => {
    if (!isTourOpen || !modalRef.current) return;

    const modal = modalRef.current;
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    modal.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      modal.removeEventListener('keydown', handleTabKey);
    };
  }, [isTourOpen, currentStep]);


  // Reset to first step when tour opens
  useEffect(() => {
    if (isTourOpen) {
      setCurrentStep(0);
    }
  }, [isTourOpen]);

  const currentStepData = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;

  if (!isTourOpen || !currentStepData) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
        aria-describedby="tour-content"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={handleSkip}
          aria-hidden="true"
        />

        {/* Modal */}
        <motion.div
          ref={modalRef}
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 z-50"
          tabIndex={-1}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Progress bar */}
          <div className="h-1 bg-gray-200 rounded-t-lg overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-600 to-purple-800"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h2
                  id="tour-title"
                  className="text-2xl font-bold text-purple-800 mb-1"
                >
                  {currentStepData.title}
                </h2>
                <p className="text-sm text-gray-500">
                  Step {currentStep + 1} of {steps.length}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSkip}
                  aria-label="Skip tour"
                  className="text-gray-500 hover:text-gray-700"
                >
                  <SkipForward className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSkip}
                  aria-label="Close tour"
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <p id="tour-content" className="text-gray-600 mb-6 leading-relaxed">
              {currentStepData.content}
            </p>

            {/* Step indicators */}
            <div className="flex justify-center gap-2 mb-6">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToStep(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentStep
                      ? 'bg-purple-600 w-8'
                      : index < currentStep
                        ? 'bg-purple-300 w-2'
                        : 'bg-gray-300 w-2'
                  }`}
                  aria-label={`Go to step ${index + 1}`}
                  aria-current={index === currentStep ? 'step' : undefined}
                />
              ))}
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between items-center gap-4">
              <Button
                onClick={prevStep}
                disabled={isFirstStep}
                variant="outline"
                className="flex items-center gap-2"
                aria-label="Previous step"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <div className="flex gap-2">
                {!isLastStep && (
                  <Button
                    variant="ghost"
                    onClick={handleSkip}
                    className="text-gray-600"
                  >
                    Skip Tour
                  </Button>
                )}
                <Button
                  onClick={isLastStep ? handleFinish : nextStep}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
                  aria-label={isLastStep ? 'Finish tour' : 'Next step'}
                >
                  {isLastStep ? (
                    'Finish'
                  ) : (
                    <>
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Keyboard hints (only show on first step) */}
            {isFirstStep && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  💡 Tip: Use arrow keys to navigate, ESC to skip
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
