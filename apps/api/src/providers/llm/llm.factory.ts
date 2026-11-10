import { env } from '../../config/env.js';
import type { LlmProvider } from './llm.provider.js';
import { MockLlmProvider } from './mock-llm.provider.js';
import { GroqLlmProvider } from './groq-llm.provider.js';
import { OpenAiLlmProvider } from './openai-llm.provider.js';
import { LlmProviderConfigurationError } from './llm-provider-error.js';

type LlmProviderConfig = Pick<typeof env, 'LLM_PROVIDER' | 'GROQ_API_KEY' | 'OPENAI_API_KEY'> & {
  GROQ_LLM_MODEL?: string;
};

export function createLlmProvider(config: LlmProviderConfig = env): LlmProvider {
  if (config.LLM_PROVIDER === 'groq') {
    const apiKey = config.GROQ_API_KEY?.trim();
    if (!apiKey) throw new LlmProviderConfigurationError('Groq LLM');
    return new GroqLlmProvider(apiKey, config.GROQ_LLM_MODEL);
  }

  if (config.LLM_PROVIDER === 'openai') {
    const apiKey = config.OPENAI_API_KEY?.trim();
    if (!apiKey) throw new LlmProviderConfigurationError('OpenAI LLM');
    return new OpenAiLlmProvider(apiKey);
  }

  return new MockLlmProvider();
}

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest;

  describe('LLM provider factory', () => {
    it('creates a marked mock provider only when mock is explicitly selected', () => {
      const provider = createLlmProvider({
        LLM_PROVIDER: 'mock',
        GROQ_API_KEY: undefined,
        OPENAI_API_KEY: undefined,
      });

      expect(provider).toBeInstanceOf(MockLlmProvider);
      expect(provider.isMock).toBe(true);
    });

    it('requires an API key for the selected external provider', () => {
      expect(() => createLlmProvider({
        LLM_PROVIDER: 'groq',
        GROQ_API_KEY: ' ',
        OPENAI_API_KEY: undefined,
      })).toThrow(LlmProviderConfigurationError);
      expect(() => createLlmProvider({
        LLM_PROVIDER: 'openai',
        GROQ_API_KEY: undefined,
        OPENAI_API_KEY: undefined,
      })).toThrow(LlmProviderConfigurationError);
    });

    it('creates the configured provider and marks it as real', () => {
      expect(createLlmProvider({
        LLM_PROVIDER: 'groq',
        GROQ_API_KEY: 'groq-test-key',
        OPENAI_API_KEY: undefined,
      })).toMatchObject({ isMock: false });
      expect(createLlmProvider({
        LLM_PROVIDER: 'openai',
        GROQ_API_KEY: undefined,
        OPENAI_API_KEY: 'openai-test-key',
      })).toBeInstanceOf(OpenAiLlmProvider);
      expect(createLlmProvider({
        LLM_PROVIDER: 'groq',
        GROQ_API_KEY: 'groq-test-key',
        OPENAI_API_KEY: undefined,
      })).toBeInstanceOf(GroqLlmProvider);
    });
  });
}
