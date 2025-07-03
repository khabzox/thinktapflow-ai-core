import { AIMetrics, GenerationMetrics } from '../types/ai';

// Metrics collector and analyzer
export const createMetricsCollector = () => {
  const metrics: GenerationMetrics[] = [];
  const maxMetrics = 10000;
  
  const record = (metric: GenerationMetrics): void => {
    metrics.push(metric);
    
    // Keep only recent metrics
    if (metrics.length > maxMetrics) {
      metrics.splice(0, metrics.length - maxMetrics);
    }
  };
  
  const getMetrics = (): GenerationMetrics[] => {
    return [...metrics];
  };
  
  const getAggregatedMetrics = (timeWindowMs = 3600000): AIMetrics => {
    const now = Date.now();
    const windowStart = now - timeWindowMs;
    
    const recentMetrics = metrics.filter(m => m.requestTime >= windowStart);
    
    const totalRequests = recentMetrics.length;
    const successfulRequests = recentMetrics.filter(m => m.success).length;
    const failedRequests = totalRequests - successfulRequests;
    
    const latencies = recentMetrics.map(m => m.responseTime - m.requestTime);
    const averageLatency = latencies.length > 0 
      ? latencies.reduce((sum, lat) => sum + lat, 0) / latencies.length 
      : 0;
    
    const totalTokensUsed = recentMetrics.reduce((sum, m) => sum + m.tokensUsed, 0);
    
    const providerUsage: Record<string, number> = {};
    const modelUsage: Record<string, number> = {};
    const errorTypes: Record<string, number> = {};
    
    recentMetrics.forEach(m => {
      // These would need to be tracked in the metrics
      // For now, we'll use placeholder logic
      if (m.error) {
        errorTypes[m.error] = (errorTypes[m.error] || 0) + 1;
      }
    });
    
    return {
      totalRequests,
      successfulRequests,
      failedRequests,
      averageLatency,
      totalTokensUsed,
      cacheHitRate: 0, // Would need cache hit tracking
      rateLimitHits: 0, // Would need rate limit tracking
      providerUsage,
      modelUsage,
      errorTypes,
    };
  };
  
  const clear = (): void => {
    metrics.length = 0;
  };
  
  return {
    record,
    getMetrics,
    getAggregatedMetrics,
    clear,
  };
};

// Global metrics collector
export const globalMetrics = createMetricsCollector();
