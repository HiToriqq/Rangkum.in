import type { LlmProvider } from '../providers/llm/llm.provider.js';
import type { MinutesData } from '../types/index.js';
import { MinutesSchema } from '../types/index.js';

export class MinutesService {
  private llmProvider: LlmProvider;

  constructor(llmProvider: LlmProvider) {
    this.llmProvider = llmProvider;
  }

  async createMinutes(transcript: string, language: 'id' | 'en'): Promise<MinutesData> {
    if (!transcript || !transcript.trim()) {
      throw new Error('Transkrip tidak boleh kosong untuk membuat notulen.');
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
