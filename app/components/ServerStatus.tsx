'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Server } from 'lucide-react';

export function ServerStatus() {
  const [status, setStatus] = useState<'online' | 'offline'>('online');

  // Simulate status changes (replace with actual API call in production)
  useEffect(() => {
    const interval = setInterval(() => {
      setStatus((prev) => (prev === 'online' ? 'offline' : 'online'));
    }, 30000); // Change status every 30 seconds for demonstration

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center space-x-2">
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className={`relative w-6 h-6 ${status === 'online' ? 'text-green-400' : 'text-red-400'}`}
      >
        <Server className="w-6 h-6" />
        <motion.div
          animate={{
            scale: [1.1, 1.5, 1.1],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className={`absolute inset-0 rounded-full ${status === 'online' ? 'bg-green-400' : 'bg-red-400'}`}
          style={{ filter: 'blur(8px)' }}
        />
      </motion.div>
      <span
        className={`text-sm font-medium ${status === 'online' ? 'text-green-400' : 'text-red-400'}`}
      >
        Server {status}
      </span>
    </div>
  );
}
