# 🚀 @thinktapflow/ai-core

> Advanced AI content generation library with multi-provider support, streaming, intelligent caching, and optimization features.

[![npm version](https://badge.fury.io/js/%40thinktapflow%2Fai-core.svg)](https://badge.fury.io/js/%40thinktapflow%2Fai-core)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- 🔥 **Multi-Provider Support** - Groq, OpenAI, Anthropic, Gemini
- ⚡ **Streaming Generation** - Real-time content streaming
- 🧠 **Intelligent Caching** - TTL-based cache with LRU eviction
- 🛡️ **Rate Limiting** - Sliding window rate limiting
- 🔄 **Auto Retry** - Exponential backoff with jitter
- 📊 **Content Analysis** - Quality, readability, SEO scoring
- 🎯 **A/B Testing** - Compare AI configurations
- 📈 **Performance Metrics** - Built-in monitoring
- 🎨 **Platform-Specific Generation** - Tailored for social platforms
- 🚀 **Batch Processing** - Handle multiple requests efficiently

## 📦 Installation

```bash
npm install @thinktapflow/ai-core
# or
yarn add @thinktapflow/ai-core
# or
pnpm add @thinktapflow/ai-core
```

## 🚀 Quick Start

```typescript
import { createAIService } from "@thinktapflow/ai-core";

// Basic usage
const ai = createAIService("groq", {
  apiKey: "your-groq-api-key",
});

const response = await ai.generateContent("Write about the future of AI");
console.log(response.content);
```

## 🔥 Advanced Usage

### Streaming Generation

```typescript
import { createAdvancedAIService } from "@thinktapflow/ai-core";

const ai = createAdvancedAIService("groq");

// Stream content generation
const stream = await ai.generateContent("Tell a story about space", {
  stream: true,
});

for await (const chunk of stream) {
  console.log(chunk.content);
  if (chunk.done) break;
}
```

### Platform-Specific Content

```typescript
// Generate Twitter-optimized content
const tweetResponse = await ai.generateContent("AI breakthrough news", {
  platform: "twitter",
  includeHashtags: true,
  tone: "excited",
});

// Generate LinkedIn post
const linkedinResponse = await ai.generateContent("Career advice", {
  platform: "linkedin",
  audience: "business",
  tone: "professional",
});
```

### Content Analysis

```typescript
const analysis = ai.analyzeContentQuality("Your content here");
console.log({
  quality: analysis.quality,
  readability: analysis.readability,
  sentiment: analysis.sentiment,
  seoScore: analysis.seoScore,
  engagementPrediction: analysis.engagementPrediction,
});
```

### A/B Testing

```typescript
const results = await ai.runABTest("Write a product description", [
  {
    id: "creative",
    options: { creativityLevel: 90, tone: "exciting" },
  },
  {
    id: "professional",
    options: { creativityLevel: 30, tone: "professional" },
  },
]);

const winner = results.find((r) => r.winner);
console.log("Winning variant:", winner);
```

### Multi-Provider Setup

```typescript
import { createMultiProvider } from "@thinktapflow/ai-core";

const multiAI = createMultiProvider([
  { type: "groq", weight: 0.6, config: { apiKey: "groq-key" } },
  { type: "openai", weight: 0.4, config: { apiKey: "openai-key" } },
]);

const response = await multiAI.generateContent("Hello world");
```

## 📚 API Reference

### Core Functions

- `createAIService(provider, config)` - Create basic AI service
- `createAdvancedAIService(provider, config)` - Create advanced AI service with all features
- `createMultiProvider(providers)` - Create multi-provider service

### Providers

- `groq` - Groq AI provider
- `openai` - OpenAI provider
- `anthropic` - Anthropic Claude (coming soon)
- `gemini` - Google Gemini (coming soon)

### Configuration Options

```typescript
interface AIServiceConfig {
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
```

## 🛠️ Configuration Presets

```typescript
import { AI_CONFIGS } from "@thinktapflow/ai-core";

// Use predefined configurations
const creativeAI = createAIService("groq", AI_CONFIGS.CREATIVE);
const factualAI = createAIService("groq", AI_CONFIGS.FACTUAL);
const codingAI = createAIService("groq", AI_CONFIGS.CODING);
```

## 📊 Monitoring & Metrics

```typescript
// Get performance metrics
const metrics = ai.getMetrics();
console.log({
  totalRequests: metrics.totalRequests,
  averageResponseTime: metrics.averageResponseTime,
  cacheHitRate: metrics.cacheHitRate,
  errorRate: metrics.errorRate,
});

// Clear cache
ai.clearCache();
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

MIT © [ThinkTapFlow](https://github.com/thinktapflow)

## 🔗 Links

- [Documentation](https://thinktapflow.github.io/ai-core)
- [GitHub](https://github.com/thinktapflow/ai-core)
- [NPM](https://www.npmjs.com/package/@thinktapflow/ai-core)
- [Issues](https://github.com/thinktapflow/ai-core/issues)
