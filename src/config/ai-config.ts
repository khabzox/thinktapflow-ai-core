import type { AIServiceConfig } from '../types';
import { AI_MODELS, DEFAULT_CONFIG } from '../constants';

export const AI_CONFIGS: Record<string, Partial<AIServiceConfig>> = {
  // Creative writing configuration
  CREATIVE: {
    ...DEFAULT_CONFIG,
    temperature: 0.9,
    maxTokens: 4096,
    model: AI_MODELS.GROQ.MIXTRAL
  },

  // Factual/informative content
  FACTUAL: {
    ...DEFAULT_CONFIG,
    temperature: 0.3,
    maxTokens: 2048,
    model: AI_MODELS.GROQ.LLAMA_70B
  },

  // Code generation
  CODING: {
    ...DEFAULT_CONFIG,
    temperature: 0.2,
    maxTokens: 4096,
    model: AI_MODELS.GROQ.MIXTRAL
  },

  // Marketing content
  MARKETING: {
    ...DEFAULT_CONFIG,
    temperature: 0.8,
    maxTokens: 1024,
    model: AI_MODELS.GROQ.LLAMA_70B
  },

  // Technical documentation
  TECHNICAL: {
    ...DEFAULT_CONFIG,
    temperature: 0.1,
    maxTokens: 3072,
    model: AI_MODELS.GROQ.LLAMA_70B
  },

  // Social media posts
  SOCIAL: {
    ...DEFAULT_CONFIG,
    temperature: 0.8,
    maxTokens: 512,
    model: AI_MODELS.GROQ.GEMMA
  },

  // High performance (fast responses)
  FAST: {
    ...DEFAULT_CONFIG,
    temperature: 0.7,
    maxTokens: 1024,
    model: AI_MODELS.GROQ.GEMMA,
    timeout: 10000
  },

  // High quality (slower but better)
  QUALITY: {
    ...DEFAULT_CONFIG,
    temperature: 0.7,
    maxTokens: 4096,
    model: AI_MODELS.GROQ.LLAMA_70B,
    timeout: 60000
  }
};