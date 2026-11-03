import type { LlmProvider } from '../providers/llm/llm.provider.js';
import type { ChatMessage, QaResponse } from '../types/index.js';

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

function chunkText(text: string, chunkSizeWords = 250, overlapWords = 50): string[] {
  const words = text.split(/\s+/);
  if (words.length <= chunkSizeWords) {
    return [text];
  }

  const chunks: string[] = [];
  let start = 0;

  while (start < words.length) {
    const end = Math.min(start + chunkSizeWords, words.length);
    const chunk = words.slice(start, end).join(' ');
    chunks.push(chunk);

    if (end >= words.length) break;
    start += chunkSizeWords - overlapWords;
  }

  return chunks;
}

export class QaService {
  private llmProvider: LlmProvider;

  constructor(llmProvider: LlmProvider) {
    this.llmProvider = llmProvider;
  }

  /**
   * Select most relevant context using simple BM25 / keyword frequency without external vector DB
   */
  private getRelevantContext(transcript: string, question: string): string {
    const words = transcript.split(/\s+/);
    // If transcript is short (< 1500 words), send the whole transcript
    if (words.length <= 1500) {
      return transcript;
    }

    const chunks = chunkText(transcript);
    const qTokens = tokenize(question);

    if (qTokens.length === 0) {
      return chunks.slice(0, 3).join('\n---\n');
    }

    // Document frequencies of query terms
    const dfMap = new Map<string, number>();
    for (const token of qTokens) {
      let df = 0;
      for (const ch of chunks) {
        if (ch.toLowerCase().includes(token)) df++;
      }
      dfMap.set(token, df);
    }

    // Score each chunk
    const scoredChunks = chunks.map((chunk, index) => {
      const cTokens = tokenize(chunk);
      let score = 0;

      for (const q of qTokens) {
        const tf = cTokens.filter((t) => t === q).length;
        if (tf > 0) {
          const df = dfMap.get(q) || 1;
          const idf = Math.log(1 + (chunks.length - df + 0.5) / (df + 0.5));
          score += (tf * (1.5 + 1)) / (tf + 1.5 * (1 - 0.75 + 0.75 * (cTokens.length / 250))) * idf;
        }
      }

      return { index, chunk, score };
    });

    // Sort by score descending and take top 3
    scoredChunks.sort((a, b) => b.score - a.score);
    const topChunks = scoredChunks.slice(0, 3);

    // Restore chronological order of selected chunks
    topChunks.sort((a, b) => a.index - b.index);

    return topChunks.map((c) => c.chunk).join('\n---\n');
  }

  async askQuestion(
    question: string,
    transcript: string,
    history: ChatMessage[] = []
  ): Promise<QaResponse> {
    if (!question || !question.trim()) {
      throw new Error('Pertanyaan tidak boleh kosong.');
    }
    if (!transcript || !transcript.trim()) {
      throw new Error('Transkrip tidak boleh kosong untuk menjawab pertanyaan.');
    }

    // Limit conversation history to the last 6 turns to keep context tidy
    const trimmedHistory = history.slice(-6);

    const relevantContext = this.getRelevantContext(transcript, question);
    return this.llmProvider.answerQuestion(question, relevantContext, trimmedHistory);
  }
}
