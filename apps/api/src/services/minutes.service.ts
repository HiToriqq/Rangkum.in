import type { LlmProvider } from '../providers/llm/llm.provider.js';
import type { MinutesData } from '../types/index.js';
import { MinutesSchema } from '../types/index.js';
import { LlmProviderUnavailableError } from '../providers/llm/llm-provider-error.js';

export class MinutesService {
  private llmProvider: LlmProvider;

  constructor(llmProvider: LlmProvider) {
    this.llmProvider = llmProvider;
  }

  get isMock(): boolean {
    return this.llmProvider.isMock;
  }

  async createMinutes(transcript: string, language: 'id' | 'en'): Promise<MinutesData> {
    if (!transcript || !transcript.trim()) {
      throw new Error('Transkrip tidak boleh kosong untuk membuat notulen.');
    }

    if (this.llmProvider.isMock) {
      throw new LlmProviderUnavailableError(
        'Pembuatan notulen belum tersedia saat LLM_PROVIDER=mock. Konfigurasikan provider Groq atau OpenAI.'
      );
    }

    const minutes = await this.llmProvider.generateMinutes(transcript, language);

    // Validate with Zod schema
    const validated = MinutesSchema.safeParse(minutes);
    if (!validated.success) {
      throw new Error(`Data notulen tidak memenuhi validasi skema: ${validated.error.message}`);
    }

    return validated.data;
  }
}

if (import.meta.vitest) {
  const { describe, expect, it, vi } = import.meta.vitest;

  describe('MinutesService', () => {
    it('does not call a mock generator or return unrelated meeting minutes', async () => {
      const provider: LlmProvider = {
        name: 'Mock LLM',
        isMock: true,
        translate: vi.fn(),
        generateMinutes: vi.fn(),
        answerQuestion: vi.fn(),
      };
      const service = new MinutesService(provider);

      await expect(service.createMinutes('Transkrip pengguna', 'id')).rejects.toMatchObject({
        name: 'LlmProviderUnavailableError',
        status: 503,
      });
      expect(provider.generateMinutes).not.toHaveBeenCalled();
    });
  });
}
