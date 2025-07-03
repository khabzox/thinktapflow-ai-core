import { RateLimitInfo } from '../types/ai';
import { AI_LIMITS } from '../constants/ai';

// Rate limiter with sliding window
export const createRateLimiter = (
  requestsPerMinute = AI_LIMITS.RATE_LIMIT_RPM,
  windowSizeMs = 60000
) => {
  const requests: number[] = [];
  
  const isAllowed = (): boolean => {
    const now = Date.now();
    const windowStart = now - windowSizeMs;
    
    // Remove old requests outside the window
    while (requests.length > 0 && requests[0] < windowStart) {
      requests.shift();
    }
    
    return requests.length < requestsPerMinute;
  };
  
  const addRequest = (): void => {
    requests.push(Date.now());
  };
  
  const getRateLimitInfo = (): RateLimitInfo => {
    const now = Date.now();
    const windowStart = now - windowSizeMs;
    
    // Clean old requests
    while (requests.length > 0 && requests[0] < windowStart) {
      requests.shift();
    }
    
    const remaining = Math.max(0, requestsPerMinute - requests.length);
    const oldestRequest = requests[0];
    const resetTime = oldestRequest ? oldestRequest + windowSizeMs : now;
    
    return {
      limit: requestsPerMinute,
      remaining,
      resetTime,
      retryAfter: remaining === 0 ? Math.ceil((resetTime - now) / 1000) : undefined,
    };
  };
  
  const waitForSlot = async (): Promise<void> => {
    const info = getRateLimitInfo();
    if (info.remaining === 0 && info.retryAfter) {
      await new Promise(resolve => setTimeout(resolve, info.retryAfter! * 1000));
    }
  };
  
  return {
    isAllowed,
    addRequest,
    getRateLimitInfo,
    waitForSlot,
  };
};

// Global rate limiters per provider
const rateLimiters = new Map<string, ReturnType<typeof createRateLimiter>>();

export const getRateLimiter = (provider: string) => {
  if (!rateLimiters.has(provider)) {
    rateLimiters.set(provider, createRateLimiter());
  }
  return rateLimiters.get(provider)!;
};
