import type { TranscriptionResult } from '../../types/index.js';

export interface SttOptions {
  language?: string; // 'auto', 'id', 'en'
  prompt?: string;
}

export interface SttProvider {
  name: string;
  transcribe(audioFilePath: string, options?: SttOptions): Promise<TranscriptionResult>;
}
