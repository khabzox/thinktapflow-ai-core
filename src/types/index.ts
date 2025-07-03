export interface AIServiceConfig {
  apiKey?: string;
  baseURL?: string;
  maxRetries?: number;
  timeout?: number;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  enableCache?: boolean;
  enableMetrics?: boolean;
  rateLimitRpm?: number;
  rateLimitTpm?: number;
}

export interface StreamResponse {
  content: string;
  done: boolean;
  metadata?: {
    model?: string;
    usage?: {
      promptTokens?: number;
      completionTokens?: number;
      totalTokens?: number;
    };
  };
}

export interface AIResponse {
  content: string;
  metadata?: {
    model?: string;
    provider?: string;
    usage?: {
      promptTokens?: number;
      completionTokens?: number;
      totalTokens?: number;
    };
    cached?: boolean;
    responseTime?: number;
  };
}

export interface ContentAnalysis {
  quality: number;
  readability: number;
  sentiment: "positive" | "negative" | "neutral";
  keywords: string[];
  wordCount: number;
  estimatedReadTime: number;
  seoScore: number;
  engagementPrediction: number;
}

export interface ABTestConfig {
  id: string;
  name?: string;
  options: Partial<AIServiceConfig>;
}

export interface ABTestResult {
  configId: string;
  content: string;
  analysis: ContentAnalysis;
  responseTime: number;
  winner?: boolean;
}

export interface GenerationOptions extends Partial<AIServiceConfig> {
  stream?: boolean;
  platform?:
    | "twitter"
    | "linkedin"
    | "facebook"
    | "instagram"
    | "blog"
    | "email";
  audience?: "general" | "technical" | "business" | "casual";
  tone?: "professional" | "casual" | "friendly" | "authoritative" | "creative";
  creativityLevel?: number; // 0-100
  includeHashtags?: boolean;
  maxLength?: number;
}

export interface AdvancedAIService {
  generateContent(
    prompt: string,
    options?: GenerationOptions
  ): Promise<AIResponse | AsyncIterableIterator<StreamResponse>>;
  analyzeContentQuality(content: string): ContentAnalysis;
  optimizePrompt(prompt: string, context?: string): string;
  runABTest(prompt: string, configs: ABTestConfig[]): Promise<ABTestResult[]>;
  batchGenerate(
    prompts: string[],
    options?: GenerationOptions
  ): Promise<AIResponse[]>;
  getMetrics(): any;
  clearCache(): void;
}

export interface CacheOptions {
  ttl?: number;
  maxSize?: number;
}

export interface RateLimitConfig {
  requestsPerMinute?: number;
  tokensPerMinute?: number;
  burstLimit?: number;
}

export interface MetricsData {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  cacheHitRate: number;
  errorRate: number;
  lastRequestTime?: number;
}

export interface RetryConfig {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  jitter?: boolean;
}

export interface BatchConfig {
  batchSize?: number;
  concurrency?: number;
  delayBetweenBatches?: number;
}
