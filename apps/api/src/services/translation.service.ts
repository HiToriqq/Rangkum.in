import type { LlmProvider } from '../providers/llm/llm.provider.js';

export class TranslationService {
  private llmProvider: LlmProvider;

  constructor(llmProvider: LlmProvider) {
    this.llmProvider = llmProvider;
  }

  async translateTranscript(text: string, targetLanguage: 'id' | 'en'): Promise<string> {
    if (!text || !text.trim()) {
      throw new Error('Teks transkrip untuk terjemahan tidak boleh kosong.');
    }

    // If text is within reasonable limit (< 3000 words), translate directly
    const words = text.trim().split(/\s+/);
    if (words.length <= 2500) {
      return this.llmProvider.translate(text, targetLanguage);
    }

    // For long transcripts, split into logical paragraph chunks
    const paragraphs = text.split(/\n\s*\n/);
    const translatedParagraphs: string[] = [];

    for (const p of paragraphs) {
      if (p.trim()) {
        const trans = await this.llmProvider.translate(p, targetLanguage);
        translatedParagraphs.push(trans);
      }
    }

    return translatedParagraphs.join('\n\n');
  }
}
