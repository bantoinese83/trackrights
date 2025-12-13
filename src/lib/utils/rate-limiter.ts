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
  private readonly maxRequests = 60; // Free tier limit
  private readonly windowMs = 60 * 1000; // 1 minute window
  private readonly minDelayMs = 1000; // Minimum 1 second between requests

  /**
   * Check if we can make a request now, or calculate wait time
   */
  async waitIfNeeded(): Promise<void> {
    const now = Date.now();

    // Remove requests outside the time window
    this.requests = this.requests.filter(
      (req) => now - req.timestamp < this.windowMs
    );

    // If we're at the limit, wait until the oldest request expires
    if (this.requests.length >= this.maxRequests && this.requests[0]) {
      const oldestRequest = this.requests[0];
      const waitTime = this.windowMs - (now - oldestRequest.timestamp) + 100; // Add 100ms buffer
      console.log(
        `Rate limit reached. Waiting ${Math.ceil(waitTime / 1000)}s...`
      );
      await this.delay(waitTime);
      // Clean up again after waiting
      this.requests = this.requests.filter(
        (req) => Date.now() - req.timestamp < this.windowMs
      );
    }

    // Ensure minimum delay between requests (1 second)
    if (this.requests.length > 0) {
      const lastRequest = this.requests[this.requests.length - 1];
      if (lastRequest !== undefined) {
        const timeSinceLastRequest = now - lastRequest.timestamp;
        if (timeSinceLastRequest < this.minDelayMs) {
          const waitTime = this.minDelayMs - timeSinceLastRequest;
          await this.delay(waitTime);
        }
      }
    }

    // Record this request
    this.requests.push({ timestamp: Date.now() });
  }

  /**
   * Get current request count in the window
   */
  getCurrentCount(): number {
    const now = Date.now();
    this.requests = this.requests.filter(
      (req) => now - req.timestamp < this.windowMs
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
