'use client';

import { Mic, FileText, Zap, DollarSign, Shield, Edit2 } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';

const features = [
  {
    icon: <Mic className="h-10 w-10 text-purple-600" />,
    title: 'Music Industry Focused',
    description:
      'Tailored analysis for artists, producers, performers, and music professionals.',
  },
  {
    icon: <FileText className="h-10 w-10 text-purple-600" />,
    title: 'Plain English Explanations',
    description:
      'Complex legal terms simplified for easy understanding by all music professionals.',
  },
  {
    icon: <Zap className="h-10 w-10 text-purple-600" />,
    title: 'Instant Analysis',
    description:
      'Get your contract breakdown in seconds, not days, regardless of your role in the industry.',
  },
  {
    icon: <DollarSign className="h-10 w-10 text-purple-600" />,
    title: 'Royalty Clarification',
    description:
      "Understand your earnings and payment structures clearly, whether you're an artist, producer, or performer.",
  },
  {
    icon: <Shield className="h-10 w-10 text-purple-600" />,
    title: 'Rights Protection',
    description:
      'Identify clauses that may impact your creative control and intellectual property rights.',
  },
  {
    icon: <Edit2 className="h-10 w-10 text-purple-600" />,
    title: 'AI-Powered Contract Revision',
    description:
      'Get suggestions for contract revisions that favor your specific role in the music industry.',
  },
];

export function Features({ id }: { id?: string }) {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, {
    margin: '-100px 0px -100px 0px',
    once: false,
  });
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;

      const currentScrollY = window.scrollY;
      const sectionTop = sectionRef.current.offsetTop;
      const sectionHeight = sectionRef.current.offsetHeight;
      const viewportHeight = window.innerHeight;

      // Calculate if we're within the section
      const isWithinSection =
        currentScrollY + viewportHeight > sectionTop &&
        currentScrollY < sectionTop + sectionHeight;

      if (isWithinSection) {
        // Determine scroll direction and toggle text
        if (currentScrollY > lastScrollY) {
          // Scrolling down
          //setShowText(false)
        } else {
          // Scrolling up
          //setShowText(true)
        }
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <section
      id={id}
      ref={sectionRef}
      className="py-24 md:py-32 bg-white relative overflow-hidden min-h-[80vh]"
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16 md:mb-24">
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-normal text-purple-600 font-salome"
            style={{
              color: 'transparent',
              WebkitTextStroke: '2px rgba(128, 90, 213, 0.8)',
            }}
          >
            Features for All Music Professionals
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{
                duration: 0.8,
                delay: index * 0.1,
                ease: 'easeInOut',
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex items-center mb-4">
                <div className="mr-4 bg-purple-100 rounded-full p-3">
                  {feature.icon}
                </div>
                <h3 className="text-xl md:text-2xl font-semibold text-purple-700">
                  {feature.title}
                </h3>
              </div>
              <p className="text-base md:text-lg text-gray-600">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
      <style jsx>{`
          @font-face {
              font-family: 'Salome';
              src: url('https://files.jcink.net/uploads/elpintor/salome/salome_italic_webfont.ttf') format('truetype');
              font-weight: normal;
              font-style: normal;
          }

      `}</style>
    </section>
  );
}