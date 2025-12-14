/**
 * Rate Limiter for Gemini API
 * Free tier limits:
 * - 20 requests per day (daily quota)
 * - 60 requests per minute (rate limit)
 * Note: The daily quota is the primary constraint on the free tier
 */

interface RequestRecord {
  timestamp: number;
}

class RateLimiter {
  private requests: RequestRecord[] = [];
  // Note: In serverless, state doesn't persist, so we use minimal delays
  private readonly minDelayMs = 500; // Minimum 500ms between requests (reduced for speed)

  private get minDelay(): number {
    return this.minDelayMs;
  }

  /**
   * Check if we can make a request now, or calculate wait time
   * Optimized for serverless: minimal delay to avoid timeouts
   */
  async waitIfNeeded(): Promise<void> {
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute window

    // Remove requests outside the time window
    this.requests = this.requests.filter(
      (req) => now - req.timestamp < windowMs
    );

    // In serverless, state doesn't persist, so be less aggressive
    // Only enforce minimum delay to avoid hitting rate limits too quickly
    if (this.requests.length > 0) {
      const lastRequest = this.requests[this.requests.length - 1];
      if (lastRequest !== undefined) {
        const timeSinceLastRequest = now - lastRequest.timestamp;
        // Reduced minimum delay to avoid timeouts
        if (timeSinceLastRequest < this.minDelay) {
          const waitTime = this.minDelay - timeSinceLastRequest;
          await this.delay(waitTime);
        }
      }
    }

    // Record this request
    this.requests.push({ timestamp: Date.now() });

    // Limit request history to prevent memory issues in long-running instances
    if (this.requests.length > 100) {
      this.requests = this.requests.slice(-60);
    }
  }

  /**
   * Get current request count in the window
   */
  getCurrentCount(): number {
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute window
    this.requests = this.requests.filter(
      (req) => now - req.timestamp < windowMs
    );
    return this.requests.length;
  }

  /**
   * Reset the rate limiter (useful for testing)
   */
  reset(): void {
    this.requests = [];
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter();

/**
 * Calculate retry delay for 429 errors based on Gemini's rate limits
 * Free tier: 60 requests/minute, so wait at least 1 second
 */
export function calculateRetryDelay(
  retryCount: number,
  apiRetryDelay?: string
): number {
  // If API provides retry delay, use it (but ensure minimum)
  if (apiRetryDelay) {
    const delayMatch = apiRetryDelay.match(/([\d.]+)s/);
    if (delayMatch && delayMatch[1]) {
      const apiDelay = Math.ceil(parseFloat(delayMatch[1]) * 1000);
      // Ensure minimum 1 second for free tier
      return Math.max(apiDelay, 1000);
    }
  }

  // Exponential backoff with minimum 1 second
  // For free tier: 1s, 2s, 4s, 8s, 16s
  const baseDelay = 1000; // 1 second minimum
  const exponentialDelay = baseDelay * Math.pow(2, retryCount);

  // Cap at 60 seconds (1 minute window)
  return Math.min(exponentialDelay, 60000);
}
