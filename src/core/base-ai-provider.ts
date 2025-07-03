import type { AIServiceConfig, AIResponse, StreamResponse } from "../types";

export interface BaseAIProvider {
  generateContent(
    prompt: string,
    options?: Partial<AIServiceConfig>
  ): Promise<AIResponse>;
  generateStream(
    prompt: string,
    options?: Partial<AIServiceConfig>
  ): AsyncIterableIterator<StreamResponse>;
  healthCheck(): Promise<boolean>;
  getProviderInfo(): { name: string; version: string; models: string[] };
}

export function createBaseProvider(
  providerName: string,
  generateFn: (
    prompt: string,
    options?: Partial<AIServiceConfig>
  ) => Promise<AIResponse>,
  streamFn: (
    prompt: string,
    options?: Partial<AIServiceConfig>
  ) => AsyncIterableIterator<StreamResponse>,
  healthCheckFn: () => Promise<boolean>,
  models: string[]
): BaseAIProvider {
  return {
    generateContent: generateFn,
    generateStream: streamFn,
    healthCheck: healthCheckFn,
    getProviderInfo: () => ({
      name: providerName,
      version: "1.0.0",
      models,
    }),
  };
}
