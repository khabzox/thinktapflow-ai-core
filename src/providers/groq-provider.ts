import Groq from 'groq-sdk';
import { AIProvider, createBaseProvider } from '../core/base-ai-provider';
import { AIGenerationOptions, ModelInfo, AIServiceError, AIServiceConfig, StreamResponse } from '../types/ai';
import { DEFAULT_CONFIG } from '../constants/ai';
import { globalCache, generateCacheKey } from '../utils/cache';
import { globalRetryHandler } from '../utils/retry';
import { getRateLimiter } from '../utils/rate-limiter';

// Functional Groq Provider
export const createGroqProvider = (config: AIServiceConfig): AIProvider => {
  const baseProvider = createBaseProvider(config);
  const client = new Groq({ apiKey: config.apiKey });
  const defaultModel = DEFAULT_CONFIG.model as string;
  const rateLimiter = getRateLimiter('groq');
  
  const generateCompletion = async (prompt: string, options: AIGenerationOptions = {}): Promise<string> => {
    // Check rate limit
    if (!rateLimiter.isAllowed()) {
      await rateLimiter.waitForSlot();
    }
    
    // Check cache first
    const cacheKey = generateCacheKey('groq', prompt, options);
    const cached = globalCache.get(cacheKey);
    if (cached) {
      return cached;
    }
    
    const result = await globalRetryHandler.retry(async () => {
      rateLimiter.addRequest();
      
      const completion = await client.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: config.model || defaultModel,
        temperature: options.temperature ?? DEFAULT_CONFIG.temperature,
        max_tokens: options.maxOutputTokens ?? DEFAULT_CONFIG.maxOutputTokens,
        top_p: options.topP ?? DEFAULT_CONFIG.topP,
        stream: false,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) throw new AIServiceError('Empty response from AI', 'EMPTY_AI_RESPONSE');

      return content;
    }, 'Groq completion');
    
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
      temperature: options.temperature ?? DEFAULT_CONFIG.temperature,
      max_tokens: options.maxOutputTokens ?? DEFAULT_CONFIG.maxOutputTokens,
      top_p: options.topP ?? DEFAULT_CONFIG.topP,
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
            latency: 0, // Would need to track request start time
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
      provider: 'groq',
      maxTokens: DEFAULT_CONFIG.maxTokens as number,
      contextWindow: DEFAULT_CONFIG.maxInputTokens as number,
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
export class GroqProvider {
  private provider: AIProvider;

  constructor(config: AIServiceConfig) {
    this.provider = createGroqProvider(config);
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
