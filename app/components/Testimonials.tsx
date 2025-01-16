'use client';

import { useRef, useEffect } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import Image from 'next/image';
import { Instagram } from 'lucide-react';

const testimonials = [
  {
    quote:
      "TrackRights.com has been a game-changer for my career. I finally understand what I'm signing!",
    author: 'DJ Harmony',
    role: 'Electronic Music Producer',
    avatar: '/placeholder.svg?height=80&width=80',
    instagram: '@dj_harmony',
  },
  {
    quote:
      'This tool saved me from a terrible deal. Every indie artist needs this in their toolkit.',
    author: 'Lyrical Genius',
    role: 'Hip Hop Artist',
    avatar: '/placeholder.svg?height=80&width=80',
    instagram: '@lyrical_genius',
  },
  {
    quote:
      'TrackRights.com simplifies the legal jargon, letting me focus on what I do best - making music.',
    author: 'Melody Maker',
    role: 'Singer-Songwriter',
    avatar: '/placeholder.svg?height=80&width=80',
    instagram: '@melodymaker',
  },
  {
    quote:
      "I've never felt more confident about my contracts. This service is worth its weight in gold!",
    author: 'Bass Master',
    role: 'EDM Producer',
    avatar: '/placeholder.svg?height=80&width=80',
    instagram: '@bass_master',
  },
  {
    quote:
      'As an independent artist, TrackRights.com has been an invaluable resource. Highly recommended!',
    author: 'Indie Rocker',
    role: 'Rock Musician',
    avatar: '/placeholder.svg?height=80&width=80',
    instagram: '@indie_rocker',
  },
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
              x: [0, -100 * testimonials.length],
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
            {[...testimonials, ...testimonials].map((testimonial, index) => (
              <motion.div
                key={index}
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
                <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 h-full flex flex-col justify-between">
                  <div>
                    <p className="text-gray-600 italic mb-4">
                      &#34;{testimonial.quote}&#34;
                    </p>
                    <div className="flex items-center mb-4">
                      <Image
                        src={testimonial.avatar || '/placeholder.svg'}
                        alt={testimonial.author}
                        width={60}
                        height={60}
                        className="rounded-full mr-4"
                      />
                      <div>
                        <p className="font-semibold text-purple-700">
                          {testimonial.author}
                        </p>
                        <p className="text-sm text-gray-500">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex justify-center">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className="h-5 w-5 text-yellow-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <a
                      href={`https://www.instagram.com/${testimonial.instagram.slice(1)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-purple-600 hover:text-purple-800 transition-colors duration-300"
                    >
                      <Instagram className="w-5 h-5 mr-1" />
                      <span className="text-sm">{testimonial.instagram}</span>
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
