import { AIProvider } from './core/base-ai-provider';
import { createAIProvider, createMultiProvider, AIProviderType } from './factory/provider-factory';
import { ContentService } from '../content/content-service';
import { SocialService } from '../social/social-service';
import {
  AIServiceConfig,
  AIGenerationOptions,
  ContentParsingResult,
  GeneratedPosts,
  GenerationMetrics,
  SupportedPlatforms,
  BatchRequest,
  BatchResponse,
  StreamResponse,
  AIMetrics,
  ProviderHealth,
} from '@/types/ai';
import { AI_DEFAULTS, DEFAULT_AI_PROVIDER, AI_LIMITS } from '@/constants/ai';
import { globalCache, generateCacheKey } from './utils/cache';
import { globalMetrics } from './utils/metrics';
import { globalBatchProcessor } from './utils/batch';
import { globalRetryHandler } from './utils/retry';
import { analyzeContent, optimizePrompt, buildContextualPrompt } from './utils/content-optimization';

// Build default config using our AI constants
const buildDefaultConfig = (): AIServiceConfig => ({
  provider: DEFAULT_AI_PROVIDER as AIProviderType,
  apiKey: process.env.GROQ_API_KEY || '',
  temperature: AI_DEFAULTS.TEMPERATURE,
  maxTokens: AI_LIMITS.MAX_TOKENS,
  topP: AI_DEFAULTS.TOP_P,
  timeout: AI_LIMITS.TIMEOUT_MS,
  maxContentLength: AI_LIMITS.MAX_INPUT_LENGTH,
  maxInputTokens: AI_LIMITS.MAX_TOKENS,
  maxOutputTokens: AI_LIMITS.MAX_OUTPUT_LENGTH
});

// Enhanced Functional AI Service with advanced features
export const createAdvancedAIService = (
  providerType: AIProviderType = DEFAULT_AI_PROVIDER as AIProviderType, 
  config: Partial<AIServiceConfig> = {}
) => {
  const fullConfig = { ...buildDefaultConfig(), ...config };
  let aiProvider = createAIProvider(providerType, fullConfig);
  const contentService = new ContentService();
  const socialService = new SocialService();
  
  // Multi-provider support for A/B testing and fallbacks
  let multiProvider: ReturnType<typeof createMultiProvider> | null = null;
  
  // Setup batch processor
  globalBatchProcessor.setProcessor(async (request: BatchRequest) => {
    return await aiProvider.generateCompletion(request.prompt, request.options);
  });

  const recordMetrics = (newMetrics: GenerationMetrics): void => {
    globalMetrics.record(newMetrics);
  };

  // Content parsing with optimization
  const parseContentFromUrl = async (url: string): Promise<ContentParsingResult> => {
    const result = await contentService.extractContent(url);
    
    // Add content analysis
    const analysis = analyzeContent(result.content);
    
    return {
      ...result,
      analysis,
    } as ContentParsingResult & { analysis: any };
  };

  // Enhanced content generation with streaming support
  const generateContent = async (
    prompt: string,
    options: AIGenerationOptions & { stream?: boolean } = {}
  ): Promise<string | AsyncIterable<StreamResponse>> => {
    const startTime = Date.now();
    
    try {
      // Optimize prompt based on options
      let optimizedPrompt = prompt;
      if (options.tone || options.contentType) {
        optimizedPrompt = buildContextualPrompt(prompt, {
          tone: options.tone,
          format: options.contentType,
          audience: options.targetAudience,
        });
      }
      
      if (options.creativityLevel) {
        const target = options.creativityLevel > 70 ? 'creativity' : 
                      options.creativityLevel > 30 ? 'accuracy' : 'speed';
        optimizedPrompt = optimizePrompt(optimizedPrompt, target);
      }
      
      if (options.stream) {
        return aiProvider.generateStream(optimizedPrompt, options);
      }
      
      const result = await aiProvider.generateCompletion(optimizedPrompt, options);
      
      recordMetrics({
        requestTime: startTime,
        responseTime: Date.now(),
        tokensUsed: result.length, // Rough estimate
        characterCount: prompt.length,
        platformCount: 1,
        success: true,
      });
      
      return result;
    } catch (error) {
      recordMetrics({
        requestTime: startTime,
        responseTime: Date.now(),
        tokensUsed: 0,
        characterCount: prompt.length,
        platformCount: 1,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      
      throw error;
    }
  };

  // Enhanced social posts generation
  const generateSocialPosts = async (
    content: string,
    platforms: SupportedPlatforms[],
    options: AIGenerationOptions = {}
  ): Promise<GeneratedPosts> => {
    const startTime = Date.now();

    try {
      const result = await socialService.generatePosts(
        content,
        platforms,
        aiProvider,
        options
      );

      recordMetrics({
        requestTime: startTime,
        responseTime: Date.now(),
        tokensUsed: result.metadata.tokensUsed,
        characterCount: content.length,
        platformCount: platforms.length,
        success: true,
      });

      return result;
    } catch (error) {
      recordMetrics({
        requestTime: startTime,
        responseTime: Date.now(),
        tokensUsed: 0,
        characterCount: content.length,
        platformCount: platforms.length,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  };

  // Batch processing for multiple requests
  const generateBatch = async (requests: Omit<BatchRequest, 'id'>[]): Promise<BatchResponse[]> => {
    const batchRequests = requests.map((req, index) => ({
      ...req,
      id: `batch_${Date.now()}_${index}`,
    }));
    
    const promises = batchRequests.map(req => globalBatchProcessor.addRequest(req));
    return Promise.all(promises);
  };

  // Provider management
  const switchProvider = (newProviderType: AIProviderType, newConfig?: Partial<AIServiceConfig>): void => {
    const fullNewConfig = { ...buildDefaultConfig(), ...newConfig };
    aiProvider = createAIProvider(newProviderType, fullNewConfig);
  };

  const setupMultiProvider = (configs: Array<{ type: AIProviderType; config: AIServiceConfig; weight?: number }>) => {
    multiProvider = createMultiProvider(configs);
  };

  const useMultiProvider = (strategy: 'random' | 'weighted' | 'round-robin' = 'weighted') => {
    if (!multiProvider) {
      throw new Error('Multi-provider not configured. Call setupMultiProvider first.');
    }
    aiProvider = multiProvider.getProvider(strategy);
  };

  // Health and monitoring
  const healthCheck = async (): Promise<ProviderHealth> => {
    const startTime = Date.now();
    
    try {
      const health = await aiProvider.healthCheck();
      
      return {
        status: health.status as 'healthy' | 'degraded' | 'unhealthy',
        latency: health.latency,
        uptime: 1, // Would need to track actual uptime
        lastCheck: Date.now(),
        errorRate: 0, // Would need to calculate from metrics
        throughput: 0, // Would need to calculate from metrics
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        latency: Date.now() - startTime,
        uptime: 0,
        lastCheck: Date.now(),
        errorRate: 1,
        throughput: 0,
      };
    }
  };

  const getMetrics = (): GenerationMetrics[] => {
    return globalMetrics.getMetrics();
  };

  const getAggregatedMetrics = (timeWindowMs?: number): AIMetrics => {
    return globalMetrics.getAggregatedMetrics(timeWindowMs);
  };

  const getCurrentProvider = (): AIProvider => aiProvider;

  // Cache management
  const clearCache = (): void => {
    globalCache.clear();
  };

  const getCacheStats = () => {
    return globalCache.getStats();
  };

  // Content analysis
  const analyzeContentQuality = (content: string) => {
    return analyzeContent(content);
  };

  // A/B Testing support
  const runABTest = async (
    prompt: string,
    variants: Array<{ id: string; options: AIGenerationOptions }>,
    sampleSize = 10
  ) => {
    const results = [];
    
    for (const variant of variants) {
      const variantResults = [];
      
      for (let i = 0; i < sampleSize; i++) {
        try {
          const result = await generateContent(prompt, variant.options);
          const analysis = analyzeContent(result as string);
          
          variantResults.push({
            content: result,
            analysis,
            latency: 0, // Would need to measure
          });
        } catch (error) {
          console.error(`A/B test variant ${variant.id} failed:`, error);
        }
      }
      
      results.push({
        variantId: variant.id,
        results: variantResults,
        averageScore: variantResults.reduce((sum, r) => sum + r.analysis.engagementPrediction, 0) / variantResults.length,
      });
    }
    
    return results;
  };

  return {
    // Core functionality
    parseContentFromUrl,
    generateContent,
    generateSocialPosts,
    generateBatch,
    
    // Provider management
    switchProvider,
    setupMultiProvider,
    useMultiProvider,
    getCurrentProvider,
    
    // Health and monitoring
    healthCheck,
    getMetrics,
    getAggregatedMetrics,
    
    // Cache management
    clearCache,
    getCacheStats,
    
    // Content analysis
    analyzeContentQuality,
    
    // A/B testing
    runABTest,
  };
};

// Simplified createAIService function (backward compatibility)
export const createAIService = (
  providerType: AIProviderType = DEFAULT_AI_PROVIDER as AIProviderType, 
  config: Partial<AIServiceConfig> = {}
) => {
  return createAdvancedAIService(providerType, config);
};

// Legacy class wrapper for backward compatibility
export class AIService {
  private service: ReturnType<typeof createAdvancedAIService>;

  constructor(providerType: AIProviderType = DEFAULT_AI_PROVIDER as AIProviderType, config: Partial<AIServiceConfig> = {}) {
    this.service = createAdvancedAIService(providerType, config);
  }

  async parseContentFromUrl(url: string): Promise<ContentParsingResult> {
    return this.service.parseContentFromUrl(url);
  }

  async generateSocialPosts(
    content: string,
    platforms: SupportedPlatforms[],
    options: AIGenerationOptions = {}
  ): Promise<GeneratedPosts> {
    return this.service.generateSocialPosts(content, platforms, options);
  }

  switchProvider(providerType: AIProviderType, config?: Partial<AIServiceConfig>): void {
    this.service.switchProvider(providerType, config);
  }

  getMetrics(): GenerationMetrics[] {
    return this.service.getMetrics();
  }

  async healthCheck() {
    return this.service.healthCheck();
  }
}
