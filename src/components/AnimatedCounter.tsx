'use client';

import { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  formatFnAction?: (value: number) => string;
}

export function AnimatedCounter({
  value,
  duration = 2,
  formatFnAction = (v: number) => v.toLocaleString(),
}: AnimatedCounterProps) {
  const [isInView, setIsInView] = useState(false);
  const springValue = useSpring(0, {
    stiffness: 50,
    damping: 20,
    duration,
  });

  const displayValue = useTransform(springValue, (current) =>
    formatFnAction(Math.floor(current))
  );

  useEffect(() => {
    if (isInView) {
      springValue.set(value);
    }
  }, [value, isInView, springValue]);

  return (
    <motion.span
      onViewportEnter={() => setIsInView(true)}
      className="tabular-nums"
    >
      {displayValue}
    </motion.span>
  );
}
