import { createGroqProvider } from '../providers/groq-provider';
import { createOpenAIProvider } from '../providers/openai-provider';
import { AIProvider } from '../core/base-ai-provider';
import { AIServiceConfig } from '@/types/ai';
import { AI_PROVIDERS, DEFAULT_AI_PROVIDER } from '@/constants/ai';

export type AIProviderType = 'groq' | 'openai' | 'anthropic' | 'gemini';

// Functional factory for creating AI providers (GROQ as default)
export const createAIProvider = (
  type: AIProviderType = DEFAULT_AI_PROVIDER as AIProviderType, 
  config: AIServiceConfig
): AIProvider => {
  switch (type) {
    case AI_PROVIDERS.GROQ:
      return createGroqProvider(config);
    case AI_PROVIDERS.OPENAI:
      return createOpenAIProvider(config);
    case AI_PROVIDERS.ANTHROPIC:
      // TODO: Implement Anthropic provider
      console.warn('Anthropic provider not yet implemented, falling back to Groq');
      return createGroqProvider(config);
    case AI_PROVIDERS.GEMINI:
      // TODO: Implement Gemini provider
      console.warn('Gemini provider not yet implemented, falling back to Groq');
      return createGroqProvider(config);
    default:
      // Always fall back to GROQ if unsupported provider is requested
      console.warn(`Unsupported AI provider: ${type}, falling back to Groq`);
      return createGroqProvider(config);
  }
};

// Helper function to get the default provider (always Groq)
export const getDefaultAIProvider = (config: AIServiceConfig): AIProvider => {
  return createGroqProvider(config);
};

// Multi-provider manager for A/B testing and fallbacks
export const createMultiProvider = (configs: Array<{ type: AIProviderType; config: AIServiceConfig; weight?: number }>) => {
  const providers = configs.map(({ type, config, weight = 1 }) => ({
    provider: createAIProvider(type, config),
    weight,
    type,
  }));
  
  const getProvider = (strategy: 'random' | 'weighted' | 'round-robin' = 'weighted'): AIProvider => {
    switch (strategy) {
      case 'random':
        return providers[Math.floor(Math.random() * providers.length)].provider;
        
      case 'weighted': {
        const totalWeight = providers.reduce((sum, p) => sum + p.weight, 0);
        let random = Math.random() * totalWeight;
        
        for (const p of providers) {
          random -= p.weight;
          if (random <= 0) return p.provider;
        }
        
        return providers[0].provider;
      }
      
      case 'round-robin': {
        // Simple round-robin (would need state management for true round-robin)
        const index = Date.now() % providers.length;
        return providers[index].provider;
      }
      
      default:
        return providers[0].provider;
    }
  };
  
  const getAllProviders = () => providers.map(p => p.provider);
  
  const healthCheck = async () => {
    const checks = await Promise.allSettled(
      providers.map(async (p) => ({
        type: p.type,
        health: await p.provider.healthCheck(),
      }))
    );
    
    return checks.map((check, index) => ({
      type: providers[index].type,
      status: check.status,
      result: check.status === 'fulfilled' ? check.value.health : { status: 'error', latency: 0, error: 'Failed to check' },
    }));
  };
  
  return {
    getProvider,
    getAllProviders,
    healthCheck,
  };
};

// Legacy class wrapper for backward compatibility
export class AIProviderFactory {
  static create = createAIProvider;
  static getDefaultProvider = getDefaultAIProvider;
  static createMultiProvider = createMultiProvider;
}
