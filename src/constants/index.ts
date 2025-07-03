export const AI_MODELS = {
  GROQ: {
    LLAMA_70B: "llama2-70b-4096",
    LLAMA_13B: "llama2-13b-chat",
    MIXTRAL: "mixtral-8x7b-32768",
    GEMMA: "gemma-7b-it",
  },
  OPENAI: {
    GPT4: "gpt-4-turbo-preview",
    GPT4_MINI: "gpt-4o-mini",
    GPT35: "gpt-3.5-turbo",
    GPT4O: "gpt-4o",
  },
} as const;

export const DEFAULT_CONFIG = {
  maxRetries: 3,
  timeout: 30000,
  temperature: 0.7,
  maxTokens: 2048,
  enableCache: true,
  enableMetrics: true,
  rateLimitRpm: 60,
  rateLimitTpm: 50000,
} as const;

export const CACHE_CONFIG = {
  DEFAULT_TTL: 3600000, // 1 hour
  MAX_SIZE: 1000,
  CLEANUP_INTERVAL: 300000, // 5 minutes
} as const;

export const RATE_LIMIT_CONFIG = {
  DEFAULT_RPM: 60,
  DEFAULT_TPM: 50000,
  BURST_LIMIT: 10,
  WINDOW_SIZE: 60000, // 1 minute
} as const;

export const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  BASE_DELAY: 1000,
  MAX_DELAY: 10000,
  BACKOFF_FACTOR: 2,
  JITTER: true,
} as const;

export const CONTENT_ANALYSIS_WEIGHTS = {
  QUALITY: {
    LENGTH: 0.2,
    COHERENCE: 0.3,
    RELEVANCE: 0.3,
    ORIGINALITY: 0.2,
  },
  READABILITY: {
    SENTENCE_LENGTH: 0.3,
    WORD_COMPLEXITY: 0.3,
    STRUCTURE: 0.4,
  },
  SEO: {
    KEYWORD_DENSITY: 0.4,
    META_OPTIMIZATION: 0.3,
    CONTENT_STRUCTURE: 0.3,
  },
} as const;

export const PLATFORM_CONFIGS = {
  twitter: {
    maxLength: 280,
    includeHashtags: true,
    tone: "casual",
    optimizeFor: "engagement",
  },
  linkedin: {
    maxLength: 3000,
    includeHashtags: false,
    tone: "professional",
    optimizeFor: "authority",
  },
  facebook: {
    maxLength: 2000,
    includeHashtags: true,
    tone: "friendly",
    optimizeFor: "shares",
  },
  instagram: {
    maxLength: 2200,
    includeHashtags: true,
    tone: "creative",
    optimizeFor: "visual",
  },
  blog: {
    maxLength: 5000,
    includeHashtags: false,
    tone: "informative",
    optimizeFor: "seo",
  },
  email: {
    maxLength: 1000,
    includeHashtags: false,
    tone: "professional",
    optimizeFor: "conversion",
  },
} as const;
