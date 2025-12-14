/**
 * Centralized Cache Utilities
 * Provides consistent caching across the application
 *
 * Note: Currently uses in-memory Map. In production, consider using
 * Redis or Vercel KV for distributed caching in serverless environments.
 */

interface CacheEntry {
  value: string;
  timestamp: number;
}

class Cache {
  private cache = new Map<string, CacheEntry>();
  private readonly TTL: number;
  private readonly maxSize: number;

  constructor(ttlMs: number = 24 * 60 * 60 * 1000, maxSize: number = 1000) {
    this.TTL = ttlMs;
    this.maxSize = maxSize;
  }

  /**
   * Get value from cache
   */
  get(key: string): string | null {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    const isExpired = Date.now() - entry.timestamp > this.TTL;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  /**
   * Set value in cache
   */
  set(key: string, value: string): void {
    // Prevent memory leaks by limiting cache size
    if (this.cache.size >= this.maxSize) {
      // Remove oldest entry (simple FIFO strategy)
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
    });
  }

  /**
   * Delete value from cache
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Clean expired entries
   */
  cleanExpired(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.TTL) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    return cleaned;
  }
}

// Singleton instance with 24-hour TTL
export const cache = new Cache(24 * 60 * 60 * 1000, 1000);

// Convenience functions for backward compatibility
export function cacheGet(key: string): string | null {
  return cache.get(key);
}

export function cacheSet(key: string, value: string): void {
  cache.set(key, value);
}
