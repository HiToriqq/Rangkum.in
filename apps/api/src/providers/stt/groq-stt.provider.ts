import fs from 'fs';
import path from 'path';
import type { SttProvider, SttOptions } from './stt.provider.js';
import type { TranscriptionResult, TranscriptionSegment } from '../../types/index.js';

export class GroqSttProvider implements SttProvider {
  name = 'Groq Whisper STT';
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model = 'whisper-large-v3') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async transcribe(audioFilePath: string, options?: SttOptions): Promise<TranscriptionResult> {
    const fileStats = await fs.promises.stat(audioFilePath);
    if (fileStats.size === 0) {
      throw new Error('File audio kosong.');
    }

    const fileBuffer = await fs.promises.readFile(audioFilePath);
    const fileName = path.basename(audioFilePath);

    const formData = new FormData();
    const blob = new Blob([fileBuffer], { type: 'audio/wav' });
    formData.append('file', blob, fileName);
    formData.append('model', this.model);
    formData.append('response_format', 'verbose_json');

    if (options?.language && options.language !== 'auto') {
      formData.append('language', options.language);
    }

    if (options?.prompt) {
      formData.append('prompt', options.prompt);
    }

    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`Groq Whisper API error (${response.status}): ${errorText}`);
    }

    const data = (await response.json()) as any;

    const segments: TranscriptionSegment[] = (data.segments || []).map((seg: any) => ({
      start: seg.start,
      end: seg.end,
      text: seg.text.trim(),
    }));

    return {
      text: data.text || '',
      language: data.language || options?.language || 'id',
      segments: segments.length > 0 ? segments : undefined,
      isMock: false,
    };
  }
}
