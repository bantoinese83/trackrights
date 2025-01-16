'use client';

import dynamic from 'next/dynamic';

const DynamicRoyaltyCalculator = dynamic(
  () => import('./RoyaltyCalculator').then((mod) => mod.default),
  { ssr: false }
);

export function ClientRoyaltyCalculator() {
  return <DynamicRoyaltyCalculator />;
}
