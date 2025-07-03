import { ContentOptimization } from '../types/ai';

// Content analysis and optimization utilities
export const analyzeContent = (content: string): ContentOptimization => {
  const words = content.split(/\s+/).filter(word => word.length > 0);
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // Calculate readability score (simplified Flesch Reading Ease)
  const avgWordsPerSentence = words.length / sentences.length;
  const avgSyllablesPerWord = calculateAvgSyllables(words);
  const readabilityScore = Math.max(0, 
    206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord)
  );
  
  // Analyze sentiment (simplified)
  const sentimentScore = analyzeSentiment(content);
  
  // Calculate keyword density
  const keywordDensity = calculateKeywordDensity(words);
  
  // Generate suggestions
  const suggestions = generateSuggestions(content, readabilityScore, sentimentScore);
  
  // SEO score (simplified)
  const seoScore = calculateSEOScore(content, keywordDensity);
  
  // Engagement prediction (simplified heuristic)
  const engagementPrediction = predictEngagement(content, sentimentScore, readabilityScore);
  
  return {
    readabilityScore: Math.round(readabilityScore),
    sentimentScore: Math.round(sentimentScore * 100) / 100,
    keywordDensity,
    suggestions,
    seoScore: Math.round(seoScore),
    engagementPrediction: Math.round(engagementPrediction * 100) / 100,
  };
};

const calculateAvgSyllables = (words: string[]): number => {
  const totalSyllables = words.reduce((sum, word) => {
    return sum + countSyllables(word);
  }, 0);
  return totalSyllables / words.length;
};

const countSyllables = (word: string): number => {
  // Simplified syllable counting
  word = word.toLowerCase();
  if (word.length <= 3) return 1;
  
  const vowels = 'aeiouy';
  let syllables = 0;
  let previousWasVowel = false;
  
  for (let i = 0; i < word.length; i++) {
    const isVowel = vowels.includes(word[i]);
    if (isVowel && !previousWasVowel) {
      syllables++;
    }
    previousWasVowel = isVowel;
  }
  
  // Adjust for silent e
  if (word.endsWith('e')) syllables--;
  
  return Math.max(1, syllables);
};

const analyzeSentiment = (content: string): number => {
  // Simplified sentiment analysis
  const positiveWords = ['good', 'great', 'excellent', 'amazing', 'awesome', 'fantastic', 'wonderful', 'love', 'best', 'perfect'];
  const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'hate', 'worst', 'disappointing', 'poor', 'weak', 'useless'];
  
  const words = content.toLowerCase().split(/\s+/);
  let score = 0;
  
  words.forEach(word => {
    if (positiveWords.includes(word)) score += 1;
    if (negativeWords.includes(word)) score -= 1;
  });
  
  // Normalize to -1 to 1 range
  return Math.max(-1, Math.min(1, score / words.length * 10));
};

const calculateKeywordDensity = (words: string[]): Record<string, number> => {
  const totalWords = words.length;
  const wordCounts: Record<string, number> = {};
  
  words.forEach(word => {
    const cleanWord = word.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (cleanWord.length > 3) { // Only count words longer than 3 characters
      wordCounts[cleanWord] = (wordCounts[cleanWord] || 0) + 1;
    }
  });
  
  const density: Record<string, number> = {};
  Object.entries(wordCounts).forEach(([word, count]) => {
    density[word] = (count / totalWords) * 100;
  });
  
  // Return top 10 keywords by density
  return Object.fromEntries(
    Object.entries(density)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
  );
};

const generateSuggestions = (
  content: string, 
  readability: number, 
  sentiment: number
): string[] => {
  const suggestions: string[] = [];
  
  if (readability < 30) {
    suggestions.push('Consider simplifying sentences and using shorter words for better readability');
  }
  
  if (sentiment < -0.2) {
    suggestions.push('Content has negative sentiment - consider adding more positive language');
  }
  
  if (content.length < 50) {
    suggestions.push('Content is quite short - consider adding more detail');
  }
  
  if (content.length > 2000) {
    suggestions.push('Content is quite long - consider breaking into smaller sections');
  }
  
  if (!/[!?]/.test(content)) {
    suggestions.push('Consider adding questions or exclamations to increase engagement');
  }
  
  return suggestions;
};

const calculateSEOScore = (content: string, keywordDensity: Record<string, number>): number => {
  let score = 50; // Base score
  
  // Length factor
  if (content.length >= 300 && content.length <= 2000) score += 20;
  
  // Keyword density factor
  const maxDensity = Math.max(...Object.values(keywordDensity));
  if (maxDensity >= 1 && maxDensity <= 3) score += 20;
  
  // Structure factor (simplified)
  if (content.includes('\n')) score += 10; // Has paragraphs
  
  return Math.min(100, score);
};

const predictEngagement = (content: string, sentiment: number, readability: number): number => {
  let score = 0.5; // Base engagement
  
  // Sentiment factor
  if (sentiment > 0.2) score += 0.2;
  else if (sentiment < -0.2) score -= 0.1;
  
  // Readability factor
  if (readability >= 60) score += 0.2;
  else if (readability < 30) score -= 0.2;
  
  // Length factor
  const length = content.length;
  if (length >= 100 && length <= 500) score += 0.1;
  
  // Question/CTA factor
  if (/[?!]/.test(content)) score += 0.1;
  
  return Math.max(0, Math.min(1, score));
};

// Prompt optimization utilities
export const optimizePrompt = (prompt: string, target: 'creativity' | 'accuracy' | 'speed'): string => {
  const basePrompt = prompt.trim();
  
  switch (target) {
    case 'creativity':
      return `${basePrompt}\n\nBe creative, original, and think outside the box. Use vivid language and unique perspectives.`;
    
    case 'accuracy':
      return `${basePrompt}\n\nBe precise, factual, and well-structured. Focus on accuracy and clarity over creativity.`;
    
    case 'speed':
      return `${basePrompt}\n\nProvide a concise, direct response. Be brief but complete.`;
    
    default:
      return basePrompt;
  }
};

export const buildContextualPrompt = (
  basePrompt: string,
  context: {
    userRole?: string;
    industry?: string;
    audience?: string;
    tone?: string;
    format?: string;
  }
): string => {
  let enhancedPrompt = basePrompt;
  
  if (context.userRole) {
    enhancedPrompt = `As a ${context.userRole}, ${enhancedPrompt}`;
  }
  
  if (context.audience) {
    enhancedPrompt += `\n\nTarget audience: ${context.audience}`;
  }
  
  if (context.tone) {
    enhancedPrompt += `\n\nTone: ${context.tone}`;
  }
  
  if (context.format) {
    enhancedPrompt += `\n\nFormat: ${context.format}`;
  }
  
  if (context.industry) {
    enhancedPrompt += `\n\nIndustry context: ${context.industry}`;
  }
  
  return enhancedPrompt;
};
