/**
 * Cache Service
 * Handles in-memory caching with TTL support
 */

interface CacheEntry<T> {
  value: T;
  timestamp: number;
}

export class CacheService {
  private cache = new Map<string, CacheEntry<unknown>>();
  private defaultTTL: number;

  constructor(defaultTTL = 60 * 60 * 1000) {
    // Default 1 hour
    this.defaultTTL = defaultTTL;
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) {
      return null;
    }

    const isExpired = Date.now() - entry.timestamp > this.defaultTTL;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  set<T>(key: string, value: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      value,
      timestamp: Date.now(),
    };
    this.cache.set(key, entry);

    if (ttl) {
      setTimeout(() => {
        this.cache.delete(key);
      }, ttl);
    }
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    return this.cache.has(key) && this.get(key) !== null;
  }

  getSize(): number {
    return this.cache.size;
  }
}

export const cacheService = new CacheService();
