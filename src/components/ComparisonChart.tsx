interface StreamingPlatform {
  name: string;
  rate: number;
  logo: string;
  width: number;
  height: number;
}

import React, { useMemo } from 'react';
import Image from 'next/image';
import { streamingPlatforms } from '@/data/streamingPlatforms';

interface ComparisonChartProps {
  streams: number;
}

export function ComparisonChart({ streams }: ComparisonChartProps) {
  const { sortedPlatforms, maxEarnings } = useMemo(() => {
    const sorted = [...streamingPlatforms].sort(
      (a: StreamingPlatform, b: StreamingPlatform) => b.rate - a.rate
    );
    const max = Math.max(
      ...sorted.map((p: StreamingPlatform) => p.rate * streams)
    );
    return { sortedPlatforms: sorted, maxEarnings: max };
  }, [streams]);

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="text-left p-2">Platform</th>
            <th className="text-right p-2">Earnings</th>
          </tr>
        </thead>
        <tbody>
          {sortedPlatforms.map((platform) => {
            const earnings = platform.rate * streams;
            const percentage = (earnings / maxEarnings) * 100;
            return (
              <tr key={platform.name} className="border-t">
                <td className="p-2 flex items-center">
                  <Image
                    src={platform.logo || '/placeholder.svg'}
                    alt={`${platform.name} logo`}
                    width={platform.width}
                    height={platform.height}
                    className="mr-2 object-contain w-auto h-6"
                  />
                  {platform.name}
                </td>
                <td className="p-2">
                  <div className="flex items-center justify-end">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        className="bg-purple-600 rounded-full h-2"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    ${earnings.toFixed(2)}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
