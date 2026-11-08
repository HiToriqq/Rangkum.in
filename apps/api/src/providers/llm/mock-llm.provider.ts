import type { LlmProvider } from './llm.provider.js';
import type { MinutesData, ChatMessage, QaResponse } from '../../types/index.js';
import { LlmProviderUnavailableError } from './llm-provider-error.js';

export class MockLlmProvider implements LlmProvider {
  name = 'Mock LLM Provider';
  isMock = true;

  async translate(_text: string, targetLanguage: 'id' | 'en'): Promise<string> {
    const targetName = targetLanguage === 'id' ? 'Bahasa Indonesia' : 'English';
    return `[Simulasi] Terjemahan ke ${targetName} tidak tersedia saat LLM_PROVIDER=mock. Konfigurasikan provider Groq atau OpenAI untuk menerjemahkan transkrip.`;
  }

  async generateMinutes(_transcript: string, _language: 'id' | 'en'): Promise<MinutesData> {
    throw new LlmProviderUnavailableError(
      'Pembuatan notulen belum tersedia saat LLM_PROVIDER=mock. Konfigurasikan provider Groq atau OpenAI.'
    );
  }

  async answerQuestion(
    _question: string,
    _transcriptContext: string,
    _history: ChatMessage[]
  ): Promise<QaResponse> {
    throw new LlmProviderUnavailableError(
      'Tanya AI belum tersedia saat LLM_PROVIDER=mock. Konfigurasikan provider Groq atau OpenAI.'
    );
  }
}
