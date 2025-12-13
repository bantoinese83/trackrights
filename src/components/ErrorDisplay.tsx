import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorDisplayProps {
  error: string;
}

export function ErrorDisplay({ error }: ErrorDisplayProps) {
  const errorLower = error.toLowerCase();
  const isRateLimit =
    (errorLower.includes('rate limit') || errorLower.includes('429')) &&
    !errorLower.includes('daily') &&
    !errorLower.includes('quota');
  const isQuota = 
    errorLower.includes('quota') ||
    errorLower.includes('daily') ||
    (errorLower.includes('429') && errorLower.includes('20 requests'));

  return (
    <motion.div
      className="max-w-md mx-auto mt-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg shadow-lg"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start">
        <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-semibold mb-1">Error</p>
          <p className="text-sm mb-3">{error}</p>
          {isRateLimit && (
            <div className="mt-3 p-3 bg-red-100 rounded border border-red-200">
              <p className="text-xs font-medium mb-1 flex items-center">
                <Lightbulb className="w-3 h-3 mr-1" />
                What to do:
              </p>
              <p className="text-xs">
                Please wait a moment and try again. The service is temporarily
                busy.
              </p>
            </div>
          )}
          {isQuota && (
            <div className="mt-3 p-3 bg-red-100 rounded border border-red-200">
              <p className="text-xs font-medium mb-1 flex items-center">
                <Lightbulb className="w-3 h-3 mr-1" />
                Daily Quota Exceeded:
              </p>
              <p className="text-xs mb-2">
                The free tier allows 20 requests per day. Your daily quota has been reached.
              </p>
              <p className="text-xs">
                <strong>Solution:</strong> The quota resets daily. Please try again tomorrow, or consider upgrading your API plan for higher limits.
              </p>
            </div>
          )}
          <Button
            onClick={() => window.location.reload()}
            size="sm"
            variant="outline"
            className="mt-3 text-xs border-red-300 text-red-700 hover:bg-red-100"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Retry
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
