'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

const buttonText = 'Lawyer Up Now';

const container = {
  hidden: { opacity: 0 },
  visible: (i = 1) => ({
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.04 * i },
  }),
};

const child = {
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 12,
      stiffness: 200,
      delay: i * 0.075, // Add delay for wave effect
    },
  }),
  hidden: {
    opacity: 0,
    y: 20,
    transition: {
      type: 'spring',
      damping: 12,
      stiffness: 200,
    },
  },
};

const hover = {
  y: [0, -10, 0],
  transition: {
    duration: 0.6,
    repeat: Infinity,
    repeatType: 'loop' as const, // Change to one of the specific string literals
    ease: 'easeInOut',
  },
};

export function CallToAction() {
  useRouter();
  const handleGetStarted = () => {
    // Smooth scroll to the top of the page
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });

    // After scrolling, focus on the file input
    setTimeout(() => {
      const fileInput = document.getElementById('contract');
      if (fileInput) {
        fileInput.focus();
      }
    }, 1000); // Adjust this delay if needed
  };

  return (
    <section className="py-16 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
      <div className="container mx-auto px-4 text-center">
        <motion.h2
          className="text-4xl md:text-5xl font-bold mb-4 text-white text-shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Ready to Simplify Your Music Contracts?
        </motion.h2>
        <motion.p
          className="text-2xl mb-8 text-white text-shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Join thousands of music professionals who trust TrackRights.com for
          clear, concise contract analysis.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Button
            size="lg"
            className="bg-gradient-to-r from-yellow-800 to-yellow-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-transform duration-300 group relative overflow-hidden rounded-full"
            onClick={handleGetStarted}
          >
            <motion.div
              initial="hidden"
              whileInView="visible" // Change from animate to whileInView
              viewport={{ once: true, margin: '-100px' }}
              variants={container}
              className="flex items-center"
            >
              {buttonText.split('').map((letter, index) => (
                <motion.span
                  key={index}
                  custom={index} // Add custom prop for index-based timing
                  variants={child}
                  whileHover={hover}
                  className="inline-block text-lg relative"
                  style={{
                    top: 0, // Add this for consistent baseline
                    display: 'inline-block',
                    whiteSpace: 'pre', // Preserve spacing
                  }}
                >
                  {letter === ' ' ? '\u00A0' : letter}
                </motion.span>
              ))}
              <motion.span
                variants={child}
                whileHover={hover}
                className="ml-2 text-lg"
              >
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </motion.span>
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-600 opacity-50 rounded-full animate-shimmer"></div>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
