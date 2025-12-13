'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Shield, FileText, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TourGuide } from './TourGuide';
import { useTour } from '@/lib/contexts/TourContext';

const glitterAnimation = `
@keyframes glitter {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
`;

interface HeroTitleProps {
  title: string;
  description: string;
  className?: string;
}

export function HeroTitle({ title, description, className }: HeroTitleProps) {
  const { openTour } = useTour();
  const [totalUsers, setTotalUsers] = useState<number | null>(null);

  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        const response = await fetch('/api/stats');
        const data = await response.json();
        setTotalUsers(data.totalUsers || 0);
      } catch (error) {
        console.error('Failed to fetch user count:', error);
        // Keep null to show fallback
      }
    };

    fetchUserCount();
    // Refresh every 5 minutes
    const interval = setInterval(fetchUserCount, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <style jsx global>{`
        ${glitterAnimation}
        .separator {
          display: inline-block;
          margin: 0 0.5rem;
          font-weight: normal;
          color: rgba(255, 255, 255, 0.5);
        }
      `}</style>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`text-center mb-12 ${className}`} // Use className here
      >
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-white leading-tight">
          {title}
        </h1>
        <p className="text-lg md:text-xl text-purple-100/90 mb-6 leading-relaxed max-w-2xl mx-auto">
          {description}
        </p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex items-center justify-center space-x-4 text-purple-200 text-sm mb-6"
        >
          <span className="flex items-center">
            <Shield className="w-4 h-4 mr-1" />
            Industry-vetted
          </span>
          <span>•</span>
          <span className="flex items-center">
            <Zap className="w-4 h-4 mr-1" />
            AI-powered
          </span>
          <span>•</span>
          <span className="flex items-center">
            <FileText className="w-4 h-4 mr-1" />
            Legal expertise
          </span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-8"
        >
          <Button
            size="lg"
            variant="outline"
            className="bg-white text-purple-600 border-purple-600 hover:bg-purple-600 hover:text-white px-8 py-3 rounded-full font-bold transition-all duration-300 flex items-center mx-auto"
            onClick={openTour}
          >
            <Map className="mr-2 h-5 w-5" />
            Take a Tour
          </Button>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-8 text-center"
        >
          <p className="text-purple-200 text-sm">
            Trusted by{' '}
            <span className="font-semibold text-white">
              {totalUsers !== null
                ? totalUsers > 0
                  ? `${totalUsers.toLocaleString()}+`
                  : '1000+'
                : '1000+'}
            </span>{' '}
            artists, producers, songwriters, managers, and music industry
            professionals
          </p>
        </motion.div>
      </motion.div>
      <TourGuide />
    </>
  );
}
