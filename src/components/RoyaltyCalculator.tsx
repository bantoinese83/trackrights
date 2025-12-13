'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calculator, Music, ChevronUp, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { ComparisonChart } from './ComparisonChart';
import { streamingPlatforms } from '@/data/streamingPlatforms';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface StreamingPlatform {
  name: string;
  rate: number;
  logo: string;
  width: number;
  height: number;
}

const currencyRates: { [key: string]: number } = {
  USD: 1,
  GBP: 0.75,
  EUR: 0.85,
};

export default function RoyaltyCalculator() {
  const [savedPlatformName, setSavedPlatformName] = useLocalStorage<string>(
    'trackrights_royalty_platform',
    streamingPlatforms[0]?.name ?? 'Qobuz'
  );
  const [platform, setPlatform] = useState<StreamingPlatform>(() => {
    const saved = streamingPlatforms.find((p) => p.name === savedPlatformName);
    return (
      saved ??
      streamingPlatforms[0] ?? {
        name: 'Qobuz',
        rate: 0.022,
        logo: '',
        width: 100,
        height: 30,
      }
    );
  });
  const [streams, setStreams] = useLocalStorage<number>(
    'trackrights_royalty_streams',
    1000
  );
  const [earnings, setEarnings] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useLocalStorage<boolean>(
    'trackrights_royalty_show_comparison',
    false
  );
  const [currency, setCurrency] = useLocalStorage<string>(
    'trackrights_royalty_currency',
    'USD'
  );

  // Update saved platform name when platform changes
  useEffect(() => {
    setSavedPlatformName(platform.name);
  }, [platform.name, setSavedPlatformName]);

  useEffect(() => {
    if (streams < 0 || isNaN(streams)) {
      setError('Please enter a valid number of streams.');
      setEarnings(0);
    } else {
      setError(null);
      const currencyRate = currencyRates[currency] ?? 1;
      setEarnings(platform.rate * streams * currencyRate);
    }
  }, [streams, platform, currency]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <div className="relative left-1/2 transform -translate-x-1/2">
          <PopoverTrigger asChild>
            <Button
              variant="default"
              size="icon"
              className="h-14 w-14 rounded-full shadow-lg bg-purple-600 hover:bg-purple-700 text-white relative"
              aria-label="Open Royalty Calculator"
            >
              <Calculator className="h-6 w-6" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-96 sm:w-[40rem] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-4rem)] overflow-y-auto rounded-lg shadow-lg border border-purple-200 bg-white mt-4"
            align="center"
            side="top"
          >
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none flex items-center">
                  <Music className="w-5 h-5 mr-2 text-purple-500" />
                  Royalty Calculator
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate your potential earnings from streaming platforms.
                </p>
              </div>
              <div className="grid gap-2">
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="platform">Platform</Label>
                  <Select
                    value={platform.name}
                    onValueChange={(value) => {
                      const foundPlatform = streamingPlatforms.find(
                        (p) => p.name === value
                      );
                      if (foundPlatform) {
                        setPlatform(foundPlatform);
                      }
                    }}
                  >
                    <SelectTrigger className="col-span-2 h-8 bg-white">
                      <SelectValue placeholder="Select platform">
                        <div className="flex items-center">
                          <Image
                            src={platform.logo || '/placeholder.svg'}
                            alt={`${platform.name} logo`}
                            width={20}
                            height={20}
                            className="mr-2 object-contain w-auto h-5"
                          />
                          {platform.name}
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {streamingPlatforms.map((p) => (
                        <SelectItem key={p.name} value={p.name}>
                          <div className="flex items-center">
                            <div className="w-5 h-5 mr-2 relative flex-shrink-0">
                              <Image
                                src={p.logo || '/placeholder.svg'}
                                alt={`${p.name} logo`}
                                width={20}
                                height={20}
                                className="object-contain w-auto h-5"
                              />
                            </div>
                            <span>{p.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="streams">Streams</Label>
                  <Input
                    id="streams"
                    type="number"
                    className="col-span-2 h-8"
                    value={streams}
                    onChange={(e) => setStreams(Number(e.target.value))}
                    aria-invalid={!!error}
                  />
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={currency}
                    onValueChange={(value) => setCurrency(value)}
                  >
                    <SelectTrigger className="col-span-2 h-8 bg-white">
                      <SelectValue placeholder="Select currency">
                        {currency}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="USD">$USD</SelectItem>
                      <SelectItem value="GBP">£GBP</SelectItem>
                      <SelectItem value="EUR">€EUR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {error && (
                  <p className="text-red-500 text-sm col-span-3">{error}</p>
                )}
              </div>
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Estimated Earnings</h4>
                <p className="text-2xl font-bold text-purple-600">
                  {currency === 'USD' ? '$' : currency === 'GBP' ? '£' : '€'}
                  {earnings.toFixed(2)}
                </p>
              </div>
              <Button
                onClick={() => setShowComparison(!showComparison)}
                variant="outline"
                className="flex items-center justify-center"
              >
                {showComparison ? 'Hide' : 'Show'} Comparison
                {showComparison ? (
                  <ChevronUp className="ml-2 h-4 w-4" />
                ) : (
                  <ChevronDown className="ml-2 h-4 w-4" />
                )}
              </Button>
              {showComparison && (
                <div className="mt-4">
                  <ComparisonChart streams={streams} />
                </div>
              )}
              <div className="text-xs text-muted-foreground">
                Note: These calculations are estimates and may not reflect
                actual earnings.
              </div>
            </div>
          </PopoverContent>
        </div>
      </Popover>
    </div>
  );
}
