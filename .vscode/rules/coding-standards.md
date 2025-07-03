# 🚀 @thinktapflow/ai-core - Coding Standards & Rules

## 🎯 **Package Philosophy**

This is a **content generation AI library** focused on:

- Multi-provider AI integration
- Streaming content generation
- Intelligent caching & optimization
- Professional TypeScript development

---

## 🔥 **CORE RULES - MUST FOLLOW**

### ❌ **FORBIDDEN PATTERNS**

```typescript
// ❌ NO CLASSES - Use functions instead
class AIService {
  constructor() {}
  generate() {}
}

// ❌ NO DEFAULT EXPORTS
export default function createAI() {}

// ❌ NO ANY TYPES
function process(data: any) {}

// ❌ NO CONSOLE.LOG in production
console.log("debug info");
```

### ✅ **REQUIRED PATTERNS**

```typescript
// ✅ FUNCTIONAL APPROACH ONLY
export function createAIService(config: AIServiceConfig) {
  return {
    generateContent: async (prompt: string) => {
      /* */
    },
    analyzeContent: (content: string) => {
      /* */
    },
  };
}

// ✅ NAMED EXPORTS ONLY
export { createAIService, analyzeContent };

// ✅ STRONG TYPING
function processContent(data: ContentData): Promise<AIResponse> {}

// ✅ STRUCTURED LOGGING
import { logger } from "./utils/logger";
logger.info("Processing request", { requestId });
```

---

## 🏗️ **ARCHITECTURE RULES**

### **1. File Organization**

```
src/
├── index.ts              # Main exports only
├── types/               # All TypeScript interfaces
├── constants/           # Configuration constants
├── core/               # Base provider interfaces
├── providers/          # AI provider implementations
├── utils/              # Utility functions
├── factory/            # Provider factory functions
└── config/             # Preset configurations
```

### **2. Import/Export Rules**

```typescript
// ✅ CORRECT - Barrel exports
export * from "./types";
export { createAIService } from "./core";

// ✅ CORRECT - Named imports
import { AIServiceConfig, AIResponse } from "../types";

// ❌ WRONG - Relative imports crossing boundaries
import { something } from "../../other-domain/file";
```

### **3. Function Naming Convention**

```typescript
// ✅ CORRECT - Descriptive action names
export function createGroqProvider() {}
export function analyzeContentQuality() {}
export function optimizePrompt() {}

// ❌ WRONG - Vague names
export function handle() {}
export function process() {}
export function doStuff() {}
```

---

## 🎨 **CODING STYLE RULES**

### **1. Function Structure**

```typescript
// ✅ TEMPLATE - Every function must follow this pattern
/**
 * Brief description of what function does
 * @param param1 - Description
 * @param param2 - Description
 * @returns Description of return value
 */
export function functionName(
  param1: Type1,
  param2: Type2,
  options?: OptionalType
): ReturnType {
  // 1. Validate inputs
  if (!param1) {
    throw new Error("param1 is required");
  }

  // 2. Main logic
  try {
    const result = processLogic(param1, param2);
    return result;
  } catch (error) {
    // 3. Error handling
    throw new Error(`functionName failed: ${error.message}`);
  }
}
```

### **2. Provider Pattern**

```typescript
// ✅ TEMPLATE - Every provider must follow this pattern
export function createXXXProvider(config: AIServiceConfig) {
  const generateContent = async (
    prompt: string,
    options?: Partial<AIServiceConfig>
  ): Promise<AIResponse> => {
    // Implementation
  };

  const generateStream = async function* (
    prompt: string,
    options?: Partial<AIServiceConfig>
  ): AsyncIterableIterator<StreamResponse> {
    // Stream implementation
  };

  const healthCheck = async (): Promise<boolean> => {
    // Health check
  };

  return createBaseProvider(
    "provider-name",
    generateContent,
    generateStream,
    healthCheck,
    ["model1", "model2"]
  );
}
```

### **3. Error Handling Rules**

```typescript
// ✅ REQUIRED - Always wrap external calls
try {
  const response = await externalAPI.call();
  return processResponse(response);
} catch (error) {
  throw new AIProviderError(`Provider X failed: ${error.message}`, {
    provider: "groq",
    originalError: error,
  });
}

// ✅ REQUIRED - Validate all inputs
if (!prompt?.trim()) {
  throw new ValidationError("Prompt cannot be empty");
}
```

---

## 📦 **PACKAGE-SPECIFIC RULES**

### **1. AI Content Generation**

```typescript
// ✅ REQUIRED - All generation functions must return this structure
interface AIResponse {
  content: string;
  metadata: {
    model: string;
    provider: string;
    usage: TokenUsage;
    responseTime: number;
  };
}

// ✅ REQUIRED - Support streaming
async function* generateStream(): AsyncIterableIterator<StreamResponse> {
  // Must yield chunks with 'done' flag
}
```

### **2. Caching Strategy**

```typescript
// ✅ REQUIRED - Cache all expensive operations
const cacheKey = `prompt:${hashPrompt(prompt)}:${JSON.stringify(options)}`;
const cached = await cache.get(cacheKey);
if (cached) return cached;

const result = await expensiveOperation();
await cache.set(cacheKey, result, TTL);
return result;
```

### **3. Rate Limiting**

```typescript
// ✅ REQUIRED - All providers must implement rate limiting
const rateLimiter = createRateLimiter({
  requestsPerMinute: 60,
  tokensPerMinute: 50000,
});

await rateLimiter.acquire(estimatedTokens);
```

---

## 🧪 **TESTING RULES**

### **1. Test Structure**

```typescript
// ✅ REQUIRED - Every function needs tests
describe("createAIService", () => {
  it("should create service with default config", () => {
    const service = createAIService("groq");
    expect(service).toBeDefined();
    expect(service.generateContent).toBeInstanceOf(Function);
  });

  it("should handle invalid provider", () => {
    expect(() => createAIService("invalid" as any)).toThrow();
  });

  it("should generate content successfully", async () => {
    const service = createAIService("groq", { apiKey: "test" });
    const result = await service.generateContent("test prompt");

    expect(result.content).toBeTruthy();
    expect(result.metadata).toBeDefined();
  });
});
```

### **2. Mock Strategy**

```typescript
// ✅ REQUIRED - Mock external dependencies
jest.mock("groq-sdk", () => ({
  Groq: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue(mockResponse),
      },
    },
  })),
}));
```

---

## 📚 **DOCUMENTATION RULES**

### **1. JSDoc Requirements**

````typescript
// ✅ REQUIRED - Every exported function needs full JSDoc
/**
 * Creates an AI service with specified provider and configuration
 *
 * @param provider - The AI provider to use ('groq', 'openai', etc.)
 * @param config - Service configuration options
 * @returns Configured AI service instance
 *
 * @example
 * ```typescript
 * const ai = createAIService('groq', { apiKey: 'your-key' });
 * const result = await ai.generateContent('Hello world');
 * ```
 */
export function createAIService(
  provider: AIProviderType,
  config?: Partial<AIServiceConfig>
): AIService {
  // Implementation
}
````

### **2. README Requirements**

````markdown
# ✅ REQUIRED - Every major feature needs documentation

## 🚀 Feature Name

Brief description of what it does.

### Usage

```typescript
// Clear, copy-pasteable example
```
````

### Configuration

```typescript
// Configuration options
```

````

---

## 🔍 **PERFORMANCE RULES**

### **1. Optimization Requirements**
```typescript
// ✅ REQUIRED - Lazy loading for heavy operations
const heavyOperation = lazy(() => import('./heavy-module'));

// ✅ REQUIRED - Debounce user inputs
const debouncedGenerate = debounce(generateContent, 500);

// ✅ REQUIRED - Memory cleanup
const cleanup = () => {
  cache.clear();
  metrics.reset();
};
````

### **2. Bundle Size Rules**

```typescript
// ✅ REQUIRED - Tree-shakeable exports
export { createAIService } from "./core";
export { analyzeContent } from "./utils";

// ❌ FORBIDDEN - Importing entire libraries
import * as lodash from "lodash";

// ✅ REQUIRED - Specific imports only
import { debounce } from "lodash-es/debounce";
```

---

## 🚀 **DEPLOYMENT RULES**

### **1. Version Strategy**

```bash
# ✅ REQUIRED - Semantic versioning
1.0.0 - Initial release
1.0.1 - Bug fixes
1.1.0 - New features
2.0.0 - Breaking changes
```

### **2. Pre-publish Checklist**

```bash
# ✅ REQUIRED - Must pass all before publishing
npm run build    # ✅ Build succeeds
npm run test     # ✅ All tests pass
npm run lint     # ✅ No linting errors
npm run type-check # ✅ No type errors
npm publish --dry-run # ✅ Package structure correct
```

---

## 🎯 **QUALITY GATES**

### **Pull Request Requirements**

- [ ] All functions use functional patterns (no classes)
- [ ] 100% TypeScript coverage (no `any` types)
- [ ] All exports are named exports
- [ ] JSDoc on all public functions
- [ ] Tests cover happy path + error cases
- [ ] No console.log statements
- [ ] Proper error handling with custom error types
- [ ] Rate limiting implemented
- [ ] Caching strategy applied
- [ ] Performance optimizations applied

### **Code Review Checklist**

- [ ] Functions are pure when possible
- [ ] Async operations are properly handled
- [ ] Error messages are descriptive
- [ ] Configuration is externalized
- [ ] No hardcoded values
- [ ] Proper logging instead of console
- [ ] Memory leaks prevented
- [ ] Bundle size impact minimized

---

## 🏆 **BEST PRACTICES**

### **1. Configuration Management**

```typescript
// ✅ BEST - Environment-aware config
const config = {
  apiKey: process.env.GROQ_API_KEY,
  maxRetries: process.env.NODE_ENV === "production" ? 3 : 1,
  timeout: process.env.AI_TIMEOUT ? parseInt(process.env.AI_TIMEOUT) : 30000,
};
```

### **2. Error Boundaries**

```typescript
// ✅ BEST - Graceful degradation
try {
  return await primaryProvider.generate(prompt);
} catch (error) {
  logger.warn("Primary provider failed, trying fallback", { error });
  return await fallbackProvider.generate(prompt);
}
```

### **3. Monitoring & Observability**

```typescript
// ✅ BEST - Built-in metrics
const startTime = Date.now();
const result = await generateContent(prompt);
metrics.recordLatency("generate_content", Date.now() - startTime);
metrics.incrementCounter("requests_total", { provider: "groq" });
```

---

## 🚨 **BREAKING CHANGE PROTOCOL**

When making breaking changes:

1. Update major version number
2. Add migration guide to README
3. Provide backward compatibility layer for 1 version
4. Add deprecation warnings
5. Update all examples

---

**Remember: This is a professional AI content generation library. Every line of code should reflect that quality standard.** 🚀
