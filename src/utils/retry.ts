import { AI_DEFAULTS } from '../constants/ai';

// Advanced retry logic with exponential backoff
export const createRetryHandler = (
  maxRetries = AI_DEFAULTS.RETRY_ATTEMPTS,
  baseDelayMs = 1000,
  maxDelayMs = 30000,
  backoffMultiplier = 2
) => {
  const isRetryableError = (error: any): boolean => {
    if (!error) return false;
    
    const retryableCodes = [
      'ECONNRESET',
      'ENOTFOUND',
      'ECONNREFUSED',
      'ETIMEDOUT',
      'RATE_LIMITED',
      'SERVER_ERROR',
      'TIMEOUT',
    ];
    
    const retryableStatusCodes = [429, 500, 502, 503, 504];
    
    return (
      retryableCodes.includes(error.code) ||
      retryableStatusCodes.includes(error.statusCode) ||
      error.message?.includes('timeout') ||
      error.message?.includes('rate limit')
    );
  };
  
  const calculateDelay = (attempt: number): number => {
    const delay = baseDelayMs * Math.pow(backoffMultiplier, attempt - 1);
    const jitter = Math.random() * 0.1 * delay; // Add 10% jitter
    return Math.min(delay + jitter, maxDelayMs);
  };
  
  const retry = async <T>(
    operation: () => Promise<T>,
    context = 'operation'
  ): Promise<T> => {
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (attempt > maxRetries || !isRetryableError(error)) {
          throw error;
        }
        
        const delay = calculateDelay(attempt);
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.warn(
          `${context} failed (attempt ${attempt}/${maxRetries + 1}). Retrying in ${delay}ms...`,
          errorMessage
        );
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  };
  
  return {
    retry,
    isRetryableError,
    calculateDelay,
  };
};

// Global retry handler
export const globalRetryHandler = createRetryHandler();
