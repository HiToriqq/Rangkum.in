import type { MinutesData, ChatMessage, QaResponse } from '../../types/index.js';

export interface LlmProvider {
  name: string;
  isMock: boolean;
  translate(text: string, targetLanguage: 'id' | 'en'): Promise<string>;
  generateMinutes(transcript: string, language: 'id' | 'en'): Promise<MinutesData>;
  answerQuestion(question: string, transcriptContext: string, history: ChatMessage[]): Promise<QaResponse>;
}
