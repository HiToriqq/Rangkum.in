import { env } from '../../config/env.js';
import type { SttProvider } from './stt.provider.js';
import { MockSttProvider } from './mock-stt.provider.js';
import { GroqSttProvider } from './groq-stt.provider.js';
import { OpenAiSttProvider } from './openai-stt.provider.js';

export function createSttProvider(): SttProvider {
  if (env.STT_PROVIDER === 'groq') {
    if (!env.GROQ_API_KEY) {
      console.warn('⚠️  GROQ_API_KEY belum disetel. Beralih ke MockSttProvider.');
      return new MockSttProvider();
    }
    return new GroqSttProvider(env.GROQ_API_KEY);
  }

  if (env.STT_PROVIDER === 'openai') {
    if (!env.OPENAI_API_KEY) {
      console.warn('⚠️  OPENAI_API_KEY belum disetel. Beralih ke MockSttProvider.');
      return new MockSttProvider();
    }
    return new OpenAiSttProvider(env.OPENAI_API_KEY);
  }

  return new MockSttProvider();
}
