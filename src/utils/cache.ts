import { CacheEntry } from '../types/ai';
import { AI_DEFAULTS } from '../constants/ai';

// In-memory cache with TTL and size management
export const createCache = <T = any>(maxSize = 1000, defaultTtl = AI_DEFAULTS.CACHE_TTL) => {
  const cache = new Map<string, CacheEntry<T>>();
  let currentSize = 0;

  const isExpired = (entry: CacheEntry<T>): boolean => {
    return Date.now() > entry.timestamp + entry.ttl;
  };

  const cleanup = (): void => {
    const now = Date.now();
    for (const [key, entry] of cache.entries()) {
      if (now > entry.timestamp + entry.ttl) {
        currentSize -= entry.size;
        cache.delete(key);
      }
    }
  };

  const evictLRU = (): void => {
    // Simple LRU - remove oldest entry
    const oldestEntry = [...cache.entries()].sort(
      ([, a], [, b]) => a.timestamp - b.timestamp
    )[0];
    
    if (oldestEntry) {
      const [key, entry] = oldestEntry;
      currentSize -= entry.size;
      cache.delete(key);
    }
  };

  const get = (key: string): T | undefined => {
    const entry = cache.get(key);
    if (!entry || isExpired(entry)) {
      if (entry) {
        currentSize -= entry.size;
        cache.delete(key);
      }
      return undefined;
    }
    
    // Update timestamp for LRU
    entry.timestamp = Date.now();
    return entry.data;
  };

  const set = (key: string, data: T, ttl = defaultTtl): void => {
    cleanup(); // Clean expired entries first
    
    const size = JSON.stringify(data).length;
    
    // Evict entries if we're at capacity
    while (currentSize + size > maxSize && cache.size > 0) {
      evictLRU();
    }
    
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      key,
      size,
    };
    
    cache.set(key, entry);
    currentSize += size;
  };

  const del = (key: string): boolean => {
    const entry = cache.get(key);
    if (entry) {
      currentSize -= entry.size;
      return cache.delete(key);
    }
    return false;
  };

  const clear = (): void => {
    cache.clear();
    currentSize = 0;
  };

  const getStats = () => ({
    size: cache.size,
    currentSize,
    maxSize,
    hitRate: 0, // Would need to track hits/misses
  });

  return {
    get,
    set,
    del,
    clear,
    cleanup,
    getStats,
  };
};

// Global cache instance
export const globalCache = createCache();

// Cache key generator
export const generateCacheKey = (
  provider: string,
  prompt: string,
  options: Record<string, any> = {}
): string => {
  const optionsString = JSON.stringify(options, Object.keys(options).sort());
  const hash = btoa(`${provider}:${prompt}:${optionsString}`).slice(0, 32);
  return `ai:${hash}`;
};
