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
    avatar:
      'https://ui-avatars.com/api/?name=DJ+Harmony&background=8b5cf6&color=fff&size=128&bold=true',
    instagram: '@dj_harmony',
  },
  {
    quote:
      'This tool saved me from a terrible deal. Every indie artist needs this in their toolkit.',
    author: 'Lyrical Genius',
    role: 'Hip Hop Artist',
    avatar:
      'https://ui-avatars.com/api/?name=Lyrical+Genius&background=7c3aed&color=fff&size=128&bold=true',
    instagram: '@lyrical_genius',
  },
  {
    quote:
      'TrackRights.com simplifies the legal jargon, letting me focus on what I do best - making music.',
    author: 'Melody Maker',
    role: 'Singer-Songwriter',
    avatar:
      'https://ui-avatars.com/api/?name=Melody+Maker&background=a855f7&color=fff&size=128&bold=true',
    instagram: '@melodymaker',
  },
  {
    quote:
      "As a manager, I use TrackRights to review all my clients' contracts. It's essential for protecting their interests.",
    author: 'Sarah Chen',
    role: 'Artist Manager',
    avatar:
      'https://ui-avatars.com/api/?name=Sarah+Chen&background=9333ea&color=fff&size=128&bold=true',
    instagram: '@sarah_chen_mgmt',
  },
  {
    quote:
      'TrackRights helped me negotiate better terms. Understanding the contract language gave me confidence at the table.',
    author: 'Marcus Johnson',
    role: 'Record Label Executive',
    avatar:
      'https://ui-avatars.com/api/?name=Marcus+Johnson&background=6d28d9&color=fff&size=128&bold=true',
    instagram: '@marcus_johnson',
  },
  {
    quote:
      "I've never felt more confident about my contracts. This service is worth its weight in gold!",
    author: 'Bass Master',
    role: 'EDM Producer',
    avatar:
      'https://ui-avatars.com/api/?name=Bass+Master&background=5b21b6&color=fff&size=128&bold=true',
    instagram: '@bass_master',
  },
  {
    quote:
      'As an independent artist, TrackRights.com has been an invaluable resource. Highly recommended!',
    author: 'Indie Rocker',
    role: 'Rock Musician',
    avatar:
      'https://ui-avatars.com/api/?name=Indie+Rocker&background=4c1d95&color=fff&size=128&bold=true',
    instagram: '@indie_rocker',
  },
  {
    quote:
      'Finally, a tool that speaks my language! TrackRights breaks down complex publishing agreements in terms I can actually understand.',
    author: 'Emma Williams',
    role: 'Music Publisher',
    avatar:
      'https://ui-avatars.com/api/?name=Emma+Williams&background=7c3aed&color=fff&size=128&bold=true',
    instagram: '@emma_williams',
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
    <section id={id} className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <h2 className="text-center mb-16">What Our Users Say</h2>
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
                <div className="bg-card text-card-foreground p-8 rounded-2xl shadow-lg border border-border/50 hover:shadow-primary/10 transition-all duration-300 h-full flex flex-col justify-between group">
                  <div>
                    <blockquote className="text-muted-foreground italic mb-6 border-none pl-0 mt-0">
                      &#34;{testimonial.quote}&#34;
                    </blockquote>
                    <div className="flex items-center mb-6">
                      <div className="relative">
                        <Image
                          src={testimonial.avatar || '/placeholder.svg'}
                          alt={testimonial.author}
                          width={64}
                          height={64}
                          className="rounded-full mr-4 border-2 border-primary/20 group-hover:border-primary transition-colors"
                        />
                        <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-1 shadow-sm">
                          <Instagram className="w-3 h-3" />
                        </div>
                      </div>
                      <div className="ml-2">
                        <p className="font-bold text-foreground group-hover:text-primary transition-colors">
                          {testimonial.author}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-auto pt-6 border-t border-border/50">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className="h-4 w-4 text-yellow-500 fill-current"
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
                      className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
                    >
                      {testimonial.instagram}
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
