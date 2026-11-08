import { env } from '../../config/env.js';
import type { SttProvider } from './stt.provider.js';
import { MockSttProvider } from './mock-stt.provider.js';
import { GroqSttProvider } from './groq-stt.provider.js';
import { OpenAiSttProvider } from './openai-stt.provider.js';
import { SttProviderConfigurationError } from './stt-provider-error.js';

type SttProviderConfig = Pick<typeof env, 'STT_PROVIDER' | 'GROQ_API_KEY' | 'OPENAI_API_KEY'>;

export function createSttProvider(config: SttProviderConfig = env): SttProvider {
  if (config.STT_PROVIDER === 'groq') {
    const apiKey = config.GROQ_API_KEY?.trim();
    if (!apiKey) throw new SttProviderConfigurationError('Groq Whisper');
    return new GroqSttProvider(apiKey);
  }

  if (config.STT_PROVIDER === 'openai') {
    const apiKey = config.OPENAI_API_KEY?.trim();
    if (!apiKey) throw new SttProviderConfigurationError('OpenAI Whisper');
    return new OpenAiSttProvider(apiKey);
  }

  return new MockSttProvider();
}

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest;

  describe('STT provider factory', () => {
    it('creates only the explicitly selected mock provider', () => {
      expect(createSttProvider({
        STT_PROVIDER: 'mock',
        GROQ_API_KEY: undefined,
        OPENAI_API_KEY: undefined,
      })).toBeInstanceOf(MockSttProvider);
    });

    it('requires an API key for the explicitly selected external provider', () => {
      expect(() => createSttProvider({
        STT_PROVIDER: 'groq',
        GROQ_API_KEY: ' ',
        OPENAI_API_KEY: undefined,
      })).toThrow(SttProviderConfigurationError);
      expect(() => createSttProvider({
        STT_PROVIDER: 'openai',
        GROQ_API_KEY: undefined,
        OPENAI_API_KEY: undefined,
      })).toThrow(SttProviderConfigurationError);
    });

    it('creates the selected provider when its API key is configured', () => {
      expect(createSttProvider({
        STT_PROVIDER: 'groq',
        GROQ_API_KEY: 'groq-test-key',
        OPENAI_API_KEY: undefined,
      })).toBeInstanceOf(GroqSttProvider);
      expect(createSttProvider({
        STT_PROVIDER: 'openai',
        GROQ_API_KEY: undefined,
        OPENAI_API_KEY: 'openai-test-key',
      })).toBeInstanceOf(OpenAiSttProvider);
    });
  });
}
