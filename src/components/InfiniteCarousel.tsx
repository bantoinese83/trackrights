import React, { useState, useRef } from 'react';
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useTransform,
  useSpring,
} from 'framer-motion';
import {
  FileText,
  Wand2,
  Shield,
  DollarSign,
  Calculator,
} from 'lucide-react';

const SCROLL_SPEED = 450; // pixels per second

interface Feature {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
}

const featureList: Feature[] = [
  {
    icon: FileText,
    text: 'Upload your contract',
  },
  {
    icon: Wand2,
    text: 'AI simplifies terms',
  },
  {
    icon: Shield,
    text: 'Protect your rights',
  },
  {
    icon: DollarSign,
    text: '100% Free',
  },
  {
    icon: Calculator,
    text: 'Royalty Calculator',
  },
];

// Double the featureList to create seamless infinite scroll
const doubledFeatureList = [...featureList, ...featureList];

export function InfiniteCarousel() {
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const baseX = useMotionValue(0);
  const springX = useSpring(baseX, { stiffness: 300, damping: 30 });
  const x = useTransform(springX, (value) => `${value}px`);

  useAnimationFrame((time) => {
    if (!isHovered) {
      const timeInSeconds = time / 1000;
      const distance = timeInSeconds * SCROLL_SPEED;
      const width = containerRef.current?.offsetWidth || 0;
      const totalWidth = width * featureList.length;
      const position = -((distance % totalWidth) / width) * 100;
      baseX.set(position);
    }
  });

  return (
    <div
      className="w-full overflow-hidden relative"
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        maskImage:
          'linear-gradient(to right, transparent, black 20%, black 80%, transparent)',
        WebkitMaskImage:
          'linear-gradient(to right, transparent, black 20%, black 80%, transparent)',
      }}
    >
      <motion.div
        className="flex items-center gap-4 sm:gap-8 md:gap-12 lg:gap-16"
        style={{ x }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {doubledFeatureList.map((feature, index) => (
          <div
            key={index}
            className="flex-shrink-0 flex items-center gap-2 sm:gap-3 text-white/70 hover:text-white/90 transition-colors duration-300"
            style={{ minWidth: '200px' }}
          >
            <feature.icon className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 flex-shrink-0" />
            <span className="text-xs sm:text-sm md:text-base lg:text-lg whitespace-nowrap">
              {feature.text}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
