'use client';

import { useRef, useEffect } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { ClientTweetCard } from '@/components/ui/client-tweet-card';

// Array of tweet IDs to display
// Replace these with actual tweet IDs from your Twitter/X account
// You can get tweet IDs from the tweet URL: https://twitter.com/username/status/TWEET_ID
const tweetIds: string[] = [
  // Add your tweet IDs here
  // Example: '1441032681968212480',
];

export function Testimonials({ id }: { id?: string }) {
  const controls = useAnimation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  // If no tweet IDs are provided, show a message or fallback
  if (tweetIds.length === 0) {
    return (
      <section id={id} className="py-16 bg-purple-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-purple-800">
            What Our Users Say
          </h2>
          <div className="text-center text-gray-600">
            <p>Add tweet IDs to display user testimonials</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id={id} className="py-16 bg-purple-50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12 text-purple-800">
          What Our Users Say
        </h2>
        <div ref={ref} className="overflow-hidden">
          <motion.div
            className="flex"
            animate={{
              x: [0, -100 * tweetIds.length],
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: 'loop',
                duration: 50,
                ease: 'linear',
              },
            }}
          >
            {[...tweetIds, ...tweetIds].map((tweetId, index) => (
              <motion.div
                key={`${tweetId}-${index}`}
                className="flex-shrink-0 w-full sm:w-1/2 md:w-1/3 p-4"
                initial="hidden"
                animate={controls}
                variants={{
                  visible: {
                    opacity: 1,
                    scale: 1,
                    transition: { duration: 0.5 },
                  },
                  hidden: { opacity: 0, scale: 0.8 },
                }}
              >
                <div className="h-full">
                  <ClientTweetCard
                    id={tweetId}
                    className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300"
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
