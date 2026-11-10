import fs from 'fs';
import os from 'os';
import path from 'path';
import { z } from 'zod';
import type { SttProvider, SttOptions } from './stt.provider.js';
import type { TranscriptionResult, TranscriptionSegment } from '../../types/index.js';
import { SttProviderError } from './stt-provider-error.js';

const ProviderResponseSchema = z.object({
  text: z.string(),
  language: z.string().optional(),
  segments: z.array(z.object({
    start: z.number(),
    end: z.number(),
    text: z.string(),
  })).optional(),
});

export abstract class OpenAiCompatibleSttProvider implements SttProvider {
  abstract readonly name: string;
  protected abstract readonly endpoint: string;
  protected readonly apiKey: string;
  protected readonly model: string;

  protected constructor(apiKey: string, model: string) {
    this.apiKey = apiKey;
    this.model = model;
  }

  async transcribe(audioFilePath: string, options?: SttOptions): Promise<TranscriptionResult> {
    const fileStats = await fs.promises.stat(audioFilePath);
    if (fileStats.size === 0) {
      throw new SttProviderError('File audio kosong.', 400);
    }

    const fileBuffer = await fs.promises.readFile(audioFilePath);
    const formData = new FormData();
    formData.append('file', new Blob([fileBuffer], { type: 'audio/wav' }), path.basename(audioFilePath));
    formData.append('model', this.model);
    formData.append('response_format', 'verbose_json');
    formData.append('temperature', '0');

    if (options?.language && options.language !== 'auto') {
      formData.append('language', options.language);
    }
    if (options?.prompt?.trim()) {
      formData.append('prompt', options.prompt.trim());
    }

    let response: Response;
    try {
      response = await fetch(this.endpoint, {
        method: 'POST',
        headers: { Authorization: `Bearer ${this.apiKey}` },
        body: formData,
        signal: AbortSignal.timeout(120_000),
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'TimeoutError') {
        throw new SttProviderError(`${this.name} tidak merespons dalam batas waktu.`);
      }
      throw new SttProviderError(`Gagal terhubung ke ${this.name}.`);
    }

    if (!response.ok) {
      throw new SttProviderError(`${this.name} menolak permintaan (HTTP ${response.status}).`);
    }

    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      throw new SttProviderError(`${this.name} mengirim respons yang tidak dapat dibaca.`);
    }

    const parsed = ProviderResponseSchema.safeParse(payload);
    if (!parsed.success || !parsed.data.text.trim()) {
      throw new SttProviderError(`${this.name} mengirim respons transkripsi yang tidak valid.`);
    }

    const segments: TranscriptionSegment[] = (parsed.data.segments || []).map((segment) => ({
      start: segment.start,
      end: segment.end,
      text: segment.text.trim(),
    }));

    return {
      text: parsed.data.text.trim(),
      language: normalizeLanguage(parsed.data.language, options?.language),
      segments: segments.length > 0 ? segments : undefined,
      isMock: false,
    };
  }
}

function normalizeLanguage(providerLanguage?: string, requestedLanguage?: string): string {
  if (!providerLanguage) return requestedLanguage && requestedLanguage !== 'auto' ? requestedLanguage : 'unknown';

  const language = providerLanguage.toLowerCase();
  if (language === 'indonesian' || language === 'bahasa indonesia') return 'id';
  if (language === 'english') return 'en';
  return language;
}

if (import.meta.vitest) {
  const { afterEach, beforeEach, describe, expect, it, vi } = import.meta.vitest;

  class TestSttProvider extends OpenAiCompatibleSttProvider {
    readonly name: string;
    protected readonly endpoint: string;

    constructor(name: string, endpoint: string, model: string, apiKey: string) {
      super(apiKey, model);
      this.name = name;
      this.endpoint = endpoint;
    }
  }

  describe.each([
    {
      name: 'Groq',
      createProvider: (key: string) =>
        new TestSttProvider('Groq', 'https://api.groq.com/openai/v1/audio/transcriptions', 'whisper-large-v3', key),
      endpoint: 'https://api.groq.com/openai/v1/audio/transcriptions',
      model: 'whisper-large-v3',
    },
    {
      name: 'OpenAI',
      createProvider: (key: string) =>
        new TestSttProvider('OpenAI', 'https://api.openai.com/v1/audio/transcriptions', 'whisper-1', key),
      endpoint: 'https://api.openai.com/v1/audio/transcriptions',
      model: 'whisper-1',
    },
  ])('$name STT provider', ({ createProvider, endpoint, model }) => {
    let directory: string;
    let audioPath: string;

    beforeEach(async () => {
      directory = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'rangkumin-stt-test-'));
      audioPath = path.join(directory, 'audio.wav');
      await fs.promises.writeFile(audioPath, Buffer.from('audio bytes'));
    });

    afterEach(async () => {
      vi.unstubAllGlobals();
      await fs.promises.rm(directory, { recursive: true, force: true });
    });

    it('sends normalized audio with the chosen language and maps the response', async () => {
      const fetchMock = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({
          text: '  Hasil transkripsi.  ',
          language: 'indonesian',
          segments: [{ start: 0, end: 1.2, text: ' Hasil transkripsi. ' }],
        }), { status: 200 })
      );
      vi.stubGlobal('fetch', fetchMock);

      await expect(createProvider('test-api-key').transcribe(audioPath, { language: 'id' }))
        .resolves.toEqual({
          text: 'Hasil transkripsi.',
          language: 'id',
          segments: [{ start: 0, end: 1.2, text: 'Hasil transkripsi.' }],
          isMock: false,
        });

      const [calledEndpoint, init] = fetchMock.mock.calls[0];
      expect(calledEndpoint).toBe(endpoint);
      expect(init.headers).toEqual({ Authorization: 'Bearer test-api-key' });
      const formData = init.body as FormData;
      expect(formData.get('model')).toBe(model);
      expect(formData.get('language')).toBe('id');
      expect(formData.get('response_format')).toBe('verbose_json');
      expect(formData.get('file')).toBeInstanceOf(File);
    });

    it('does not expose provider response bodies in errors', async () => {
      const fetchMock = vi.fn().mockResolvedValue(
        new Response('sensitive provider response', { status: 401 })
      );
      vi.stubGlobal('fetch', fetchMock);

      await expect(createProvider('test-api-key').transcribe(audioPath))
        .rejects.toThrow(`${createProvider('test-api-key').name} menolak permintaan (HTTP 401).`);
    });
  });
}
