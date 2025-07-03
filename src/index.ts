// Core exports
export * from './types';
export * from './constants';

// Provider exports
export { createGroqProvider } from './providers/groq-provider';
export { createOpenAIProvider } from './providers/openai-provider';

// Factory exports
export { 
  createAIProvider, 
  createMultiProvider, 
  type AIProviderType 
} from './factory/provider-factory';

// Service exports
export { 
  createAIService, 
  createAdvancedAIService,
  createAIServiceLegacy 
} from './ai-service';

// Utility exports
export { globalCache } from './utils/cache';
export { globalMetrics } from './utils/metrics';
export { globalBatchProcessor } from './utils/batch';
export { globalRetryHandler } from './utils/retry';
export { createRateLimiter } from './utils/rate-limiter';
export { 
  analyzeContent, 
  optimizePrompt, 
  buildContextualPrompt 
} from './utils/content-optimization';

// Configuration exports
export { AI_CONFIGS } from './config/ai-config';

// Version info
export const VERSION = '1.0.0';
export const PACKAGE_NAME = '@thinktapflow/ai-core';