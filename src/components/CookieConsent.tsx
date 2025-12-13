'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Cookie } from 'lucide-react';
import Link from 'next/link';

export function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (consent === null) {
      setShowConsent(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setShowConsent(false);
  };

  return (
    <AnimatePresence>
      {showConsent && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-0 left-0 right-0 p-4 bg-gray-900/90 backdrop-blur-sm z-50"
        >
          <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-white">
              <Cookie className="h-6 w-6 text-purple-400" />
              <p className="text-sm">
                We use cookies to enhance your experience. By continuing to
                visit this site you agree to our use of cookies.
              </p>
            </div>
            <div className="flex gap-4 shrink-0">
              <Button variant="outline" asChild>
                <Link
                  href="/cookies"
                  className="text-purple-300 hover:text-purple-100"
                >
                  Learn more
                </Link>
              </Button>
              <Button
                onClick={handleAccept}
                variant="default"
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Accept
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
