import type { LlmProvider } from '../providers/llm/llm.provider.js';

export class TranslationService {
  private llmProvider: LlmProvider;

  constructor(llmProvider: LlmProvider) {
    this.llmProvider = llmProvider;
  }

  get isMock(): boolean {
    return this.llmProvider.isMock;
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

    const chunks: string[] = [];
    let currentChunk: string[] = [];
    let currentWordCount = 0;

    for (const paragraph of text.split(/\n\s*\n/)) {
      const paragraphWords = paragraph.trim().split(/\s+/);
      if (!paragraph.trim()) continue;

      if (paragraphWords.length > 2500) {
        if (currentChunk.length > 0) {
          chunks.push(currentChunk.join('\n\n'));
          currentChunk = [];
          currentWordCount = 0;
        }
        for (let offset = 0; offset < paragraphWords.length; offset += 2500) {
          chunks.push(paragraphWords.slice(offset, offset + 2500).join(' '));
        }
        continue;
      }

      if (currentWordCount + paragraphWords.length > 2500) {
        chunks.push(currentChunk.join('\n\n'));
        currentChunk = [];
        currentWordCount = 0;
      }

      currentChunk.push(paragraph.trim());
      currentWordCount += paragraphWords.length;
    }

    if (currentChunk.length > 0) chunks.push(currentChunk.join('\n\n'));

    const translatedChunks: string[] = [];
    for (const chunk of chunks) {
      translatedChunks.push(await this.llmProvider.translate(chunk, targetLanguage));
    }

    return translatedChunks.join('\n\n');
  }
}

if (import.meta.vitest) {
  const { describe, expect, it, vi } = import.meta.vitest;

  function createTestProvider(translate: LlmProvider['translate']): LlmProvider {
    return {
      name: 'Test LLM',
      isMock: false,
      translate,
      generateMinutes: vi.fn(),
      answerQuestion: vi.fn(),
    };
  }

  describe('TranslationService', () => {
    it('rejects whitespace-only source text and identifies mock providers', async () => {
      const service = new TranslationService({
        ...createTestProvider(vi.fn()),
        isMock: true,
      });

      expect(service.isMock).toBe(true);
      await expect(service.translateTranscript('   ', 'en')).rejects.toThrow('tidak boleh kosong');
    });

    it('splits long transcript content into provider-sized chunks', async () => {
      const translate = vi.fn(async (text: string) => `[translated ${text.split(/\s+/).length}]`);
      const service = new TranslationService(createTestProvider(translate));
      const source = Array.from({ length: 2501 }, (_, index) => `word${index}`).join(' ');

      const result = await service.translateTranscript(source, 'en');

      expect(translate).toHaveBeenCalledTimes(2);
      expect(translate.mock.calls.map(([chunk]) => chunk.split(/\s+/).length)).toEqual([2500, 1]);
      expect(result).toBe('[translated 2500]\n\n[translated 1]');
    });
  });
}
