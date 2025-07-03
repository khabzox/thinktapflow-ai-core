import OpenAI from 'openai';
import { AIProvider, createBaseProvider } from '../core/base-ai-provider';
import { AIGenerationOptions, ModelInfo, AIServiceError, AIServiceConfig, StreamResponse } from '../types/ai';
import { OPENAI_MODELS } from '../constants/ai';
import { globalCache, generateCacheKey } from '../utils/cache';
import { globalRetryHandler } from '../utils/retry';
import { getRateLimiter } from '../utils/rate-limiter';

// Functional OpenAI Provider
export const createOpenAIProvider = (config: AIServiceConfig): AIProvider => {
  const baseProvider = createBaseProvider(config);
  const client = new OpenAI({ apiKey: config.apiKey });
  const defaultModel = OPENAI_MODELS.BALANCED;
  const rateLimiter = getRateLimiter('openai');

  const generateCompletion = async (prompt: string, options: AIGenerationOptions = {}): Promise<string> => {
    // Check rate limit
    if (!rateLimiter.isAllowed()) {
      await rateLimiter.waitForSlot();
    }
    
    // Check cache first
    const cacheKey = generateCacheKey('openai', prompt, options);
    const cached = globalCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const result = await globalRetryHandler.retry(async () => {
      rateLimiter.addRequest();
      
      const completion = await client.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: config.model || defaultModel,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxOutputTokens ?? 2048,
        top_p: options.topP ?? 0.8,
        stream: false,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) throw new AIServiceError('Empty response from AI', 'EMPTY_AI_RESPONSE');

      return content;
    }, 'OpenAI completion');
    
    // Cache the result
    globalCache.set(cacheKey, result);
    
    return result;
  };

  const generateStream = async function* (prompt: string, options: AIGenerationOptions = {}): AsyncIterable<StreamResponse> {
    // Check rate limit
    if (!rateLimiter.isAllowed()) {
      await rateLimiter.waitForSlot();
    }
    
    rateLimiter.addRequest();
    
    const stream = await client.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: config.model || defaultModel,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxOutputTokens ?? 2048,
      top_p: options.topP ?? 0.8,
      stream: true,
    });

    let totalTokens = 0;
    
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      const done = chunk.choices[0]?.finish_reason !== null;
      
      if (content) {
        totalTokens += content.length; // Rough estimate
        
        yield {
          content,
          done,
          tokens: totalTokens,
          metadata: {
            model: config.model || defaultModel,
            timestamp: Date.now(),
            latency: 0,
          },
        };
      }
      
      if (done) break;
    }
  };

  const validateCredentials = async (): Promise<boolean> => {
    try {
      await client.models.list();
      return true;
    } catch {
      return false;
    }
  };

  const getModelInfo = (): ModelInfo => {
    return {
      name: config.model || defaultModel,
      provider: 'openai',
      maxTokens: 4096,
      contextWindow: 16384,
    };
  };

  return {
    ...baseProvider,
    generateCompletion,
    generateStream,
    validateCredentials,
    getModelInfo,
  };
};

// Legacy class wrapper for backward compatibility
export class OpenAIProvider {
  private provider: AIProvider;

  constructor(config: AIServiceConfig) {
    this.provider = createOpenAIProvider(config);
  }

  async generateCompletion(prompt: string, options: AIGenerationOptions = {}): Promise<string> {
    return this.provider.generateCompletion(prompt, options);
  }

  async validateCredentials(): Promise<boolean> {
    return this.provider.validateCredentials();
  }

  getModelInfo(): ModelInfo {
    return this.provider.getModelInfo();
  }

  generateStream(prompt: string, options: AIGenerationOptions = {}): AsyncIterable<StreamResponse> {
    return this.provider.generateStream(prompt, options);
  }
}