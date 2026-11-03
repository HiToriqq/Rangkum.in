import { env } from '../../config/env.js';
import type { LlmProvider } from './llm.provider.js';
import { MockLlmProvider } from './mock-llm.provider.js';
import { GroqLlmProvider } from './groq-llm.provider.js';
import { OpenAiLlmProvider } from './openai-llm.provider.js';

export function createLlmProvider(): LlmProvider {
  if (env.LLM_PROVIDER === 'groq') {
    if (!env.GROQ_API_KEY) {
      console.warn('⚠️  GROQ_API_KEY belum disetel. Beralih ke MockLlmProvider.');
      return new MockLlmProvider();
    }
    return new GroqLlmProvider(env.GROQ_API_KEY);
  }

  if (env.LLM_PROVIDER === 'openai') {
    if (!env.OPENAI_API_KEY) {
      console.warn('⚠️  OPENAI_API_KEY belum disetel. Beralih ke MockLlmProvider.');
      return new MockLlmProvider();
    }
    return new OpenAiLlmProvider(env.OPENAI_API_KEY);
  }

  return new MockLlmProvider();
}
