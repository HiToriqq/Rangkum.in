import { z } from 'zod';
import type { MinutesData, QaMessage } from '../types';

const ApiHealthSchema = z.object({
  status: z.literal('ok'),
  timestamp: z.string(),
  service: z.string(),
  providers: z.object({
    stt: z.string(),
    sttConfigured: z.boolean(),
    llm: z.string(),
    llmConfigured: z.boolean(),
  }),
});

const TranscriptionSchema = z.object({
  text: z.string(),
  language: z.string(),
  segments: z.array(
    z.object({
      start: z.number(),
      end: z.number(),
      text: z.string(),
      speaker: z.string().optional(),
    })
  ).optional(),
  isMock: z.boolean().optional(),
});

const TranslationSchema = z.object({
  translatedText: z.string().min(1),
  targetLanguage: z.enum(['id', 'en']),
  isMock: z.boolean(),
});

const MinutesSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  discussionPoints: z.array(z.string()),
  decisions: z.array(z.string()),
  actionItems: z.array(z.object({
    task: z.string().min(1),
    owner: z.string(),
    dueDate: z.string(),
  })),
  openIssues: z.array(z.string()),
  notes: z.array(z.string()),
  needsVerification: z.boolean().optional(),
});

const MinutesResponseSchema = z.object({
  minutes: MinutesSchema,
  isMock: z.boolean(),
});

const QaResponseSchema = z.object({
  answer: z.string().min(1),
  references: z.array(z.string()).optional(),
  isMock: z.boolean(),
});

export type ApiHealth = z.infer<typeof ApiHealthSchema>;
export type TranscriptionResponse = z.infer<typeof TranscriptionSchema>;
export type TranslationResponse = z.infer<typeof TranslationSchema>;
export type MinutesResponse = { minutes: MinutesData; isMock: boolean };
export type QaResponse = z.infer<typeof QaResponseSchema>;

export class ApiRequestError extends Error {
  constructor(
    message: string,
    public readonly status?: number
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

async function parseResponse<T>(response: Response, schema: z.ZodType<T>): Promise<T> {
  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new ApiRequestError(
      response.ok
        ? 'Respons backend tidak dapat dibaca.'
        : `Backend mengembalikan error (HTTP ${response.status}).`,
      response.status
    );
  }

  if (!response.ok) {
    const errorPayload = z.object({ error: z.string() }).safeParse(payload);
    throw new ApiRequestError(
      errorPayload.success ? errorPayload.data.error : `Permintaan gagal (HTTP ${response.status}).`,
      response.status
    );
  }

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    throw new ApiRequestError('Format respons backend tidak sesuai.');
  }

  return parsed.data;
}

export async function getApiHealth(signal?: AbortSignal): Promise<ApiHealth> {
  let response: Response;
  try {
    response = await fetch('/api/health', { cache: 'no-store', signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new ApiRequestError('Backend belum dapat dijangkau. Pastikan API berjalan di port 3001.');
  }

  return parseResponse(response, ApiHealthSchema);
}

export type TranscriptionInput =
  | { type: 'file'; file: Blob; fileName: string; language: 'auto' | 'id' | 'en' }
  | { type: 'url'; url: string; language: 'auto' | 'id' | 'en' };

export async function transcribeAudio(
  input: TranscriptionInput,
  signal?: AbortSignal
): Promise<TranscriptionResponse> {
  const init: RequestInit = { method: 'POST', signal };

  if (input.type === 'url') {
    init.headers = { 'Content-Type': 'application/json' };
    init.body = JSON.stringify({ url: input.url, language: input.language });
  } else {
    const formData = new FormData();
    formData.append('audio', input.file, input.fileName);
    formData.append('language', input.language);
    init.body = formData;
  }

  let response: Response;
  try {
    response = await fetch('/api/transcribe', init);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new ApiRequestError('Backend belum dapat dijangkau. Pastikan API berjalan di port 3001.');
  }

  return parseResponse(response, TranscriptionSchema);
}

export async function translateTranscript(
  text: string,
  targetLanguage: 'id' | 'en',
  signal?: AbortSignal
): Promise<TranslationResponse> {
  let response: Response;
  try {
    response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, targetLanguage }),
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new ApiRequestError('Backend belum dapat dijangkau. Pastikan API berjalan di port 3001.');
  }

  return parseResponse(response, TranslationSchema);
}

export async function generateMinutes(
  transcript: string,
  language: 'id' | 'en',
  signal?: AbortSignal
): Promise<MinutesResponse> {
  let response: Response;
  try {
    response = await fetch('/api/minutes/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript, language }),
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new ApiRequestError('Backend belum dapat dijangkau. Pastikan API berjalan di port 3001.');
  }

  return parseResponse(response, MinutesResponseSchema);
}

export async function askQuestion(
  question: string,
  transcript: string,
  history: Pick<QaMessage, 'role' | 'content'>[],
  signal?: AbortSignal
): Promise<QaResponse> {
  let response: Response;
  try {
    response = await fetch('/api/qa/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, transcript, history }),
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new ApiRequestError('Backend belum dapat dijangkau. Pastikan API berjalan di port 3001.');
  }

  return parseResponse(response, QaResponseSchema);
}

export async function exportMinutesPdf(
  minutes: MinutesData,
  language: 'id' | 'en',
  signal?: AbortSignal
): Promise<Blob> {
  let response: Response;
  try {
    response = await fetch('/api/export/pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ minutes, language }),
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new ApiRequestError('Backend belum dapat dijangkau. Pastikan API berjalan di port 3001.');
  }

  if (!response.ok) {
    let message = `Permintaan gagal (HTTP ${response.status}).`;
    try {
      const payload: unknown = await response.json();
      const errorPayload = z.object({ error: z.string() }).safeParse(payload);
      if (errorPayload.success) message = errorPayload.data.error;
    } catch {
      // Use the HTTP status when the server does not return a JSON error.
    }
    throw new ApiRequestError(message, response.status);
  }

  if (!response.headers.get('content-type')?.toLowerCase().includes('application/pdf')) {
    throw new ApiRequestError('Format file ekspor backend bukan PDF.');
  }

  const blob = await response.blob();
  if (blob.size === 0) {
    throw new ApiRequestError('File PDF yang diterima kosong.');
  }
  return blob;
}

if (import.meta.vitest) {
  const { afterEach, describe, expect, it, vi } = import.meta.vitest;

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('Backend API client', () => {
    it('reads provider status from the health endpoint', async () => {
      const fetchMock = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({
          status: 'ok',
          timestamp: '2026-11-08T00:00:00.000Z',
          service: 'Rangkum.in API',
          providers: { stt: 'mock', sttConfigured: true, llm: 'mock', llmConfigured: true },
        }), { status: 200 })
      );
      vi.stubGlobal('fetch', fetchMock);

      await expect(getApiHealth()).resolves.toMatchObject({
        status: 'ok',
        providers: { stt: 'mock' },
      });
      expect(fetchMock).toHaveBeenCalledWith('/api/health', expect.objectContaining({ cache: 'no-store' }));
    });

    it('sends uploaded audio as multipart form data', async () => {
      const fetchMock = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ text: 'transkrip', language: 'id', isMock: false }), { status: 200 })
      );
      vi.stubGlobal('fetch', fetchMock);

      const audio = new Blob(['audio bytes'], { type: 'audio/webm' });
      await expect(transcribeAudio({
        type: 'file',
        file: audio,
        fileName: 'rekaman.webm',
        language: 'id',
      })).resolves.toMatchObject({ text: 'transkrip', language: 'id' });

      const [, init] = fetchMock.mock.calls[0];
      expect(init.method).toBe('POST');
      expect(init.body).toBeInstanceOf(FormData);
      expect((init.body as FormData).get('language')).toBe('id');
      expect((init.body as FormData).get('audio')).toBeInstanceOf(File);
    });

    it('sends direct audio URLs as JSON and surfaces backend errors', async () => {
      const fetchMock = vi.fn()
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ text: 'transkrip', language: 'id' }), { status: 200 })
        )
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ error: 'Tautan URL ditolak.' }), { status: 400 })
        );
      vi.stubGlobal('fetch', fetchMock);

      await transcribeAudio({ type: 'url', url: 'https://example.com/audio.wav', language: 'auto' });
      expect(fetchMock.mock.calls[0][1].body).toBe(
        JSON.stringify({ url: 'https://example.com/audio.wav', language: 'auto' })
      );

      await expect(transcribeAudio({
        type: 'url',
        url: 'https://example.com/audio.wav',
        language: 'auto',
      })).rejects.toMatchObject({ message: 'Tautan URL ditolak.', status: 400 });
    });

    it('sends translation requests and requires an explicit mock flag in the response', async () => {
      const fetchMock = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({
          translatedText: 'Translated text',
          targetLanguage: 'en',
          isMock: true,
        }), { status: 200 })
      );
      vi.stubGlobal('fetch', fetchMock);

      await expect(translateTranscript('Teks sumber', 'en')).resolves.toMatchObject({
        translatedText: 'Translated text',
        targetLanguage: 'en',
        isMock: true,
      });
      expect(fetchMock.mock.calls[0][1].body).toBe(
        JSON.stringify({ text: 'Teks sumber', targetLanguage: 'en' })
      );
    });

    it('validates generated minutes responses and surfaces provider unavailability', async () => {
      const fetchMock = vi.fn()
        .mockResolvedValueOnce(
          new Response(JSON.stringify({
            minutes: {
              title: 'Rapat',
              summary: 'Ringkasan',
              discussionPoints: [],
              decisions: [],
              actionItems: [],
              openIssues: [],
              notes: [],
            },
            isMock: false,
          }), { status: 200 })
        )
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ error: 'Pembuatan notulen belum tersedia saat LLM_PROVIDER=mock.' }), { status: 503 })
        );
      vi.stubGlobal('fetch', fetchMock);

      await expect(generateMinutes('Transkrip', 'id')).resolves.toMatchObject({
        minutes: { title: 'Rapat', summary: 'Ringkasan' },
        isMock: false,
      });
      expect(fetchMock.mock.calls[0][1].body).toBe(
        JSON.stringify({ transcript: 'Transkrip', language: 'id' })
      );
      await expect(generateMinutes('Transkrip', 'id')).rejects.toMatchObject({
        message: 'Pembuatan notulen belum tersedia saat LLM_PROVIDER=mock.',
        status: 503,
      });
    });

    it('sends Q&A history, validates answers, and surfaces provider unavailability', async () => {
      const fetchMock = vi.fn()
        .mockResolvedValueOnce(
          new Response(JSON.stringify({
            answer: 'Berdasarkan transkrip, rapat dimulai pukul 10.',
            references: ['00:01 - 00:04'],
            isMock: false,
          }), { status: 200 })
        )
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ error: 'Tanya AI belum tersedia saat LLM_PROVIDER=mock.' }), { status: 503 })
        );
      vi.stubGlobal('fetch', fetchMock);
      const history = [{ role: 'user' as const, content: 'Kapan rapat dimulai?' }];

      await expect(askQuestion('Apa waktunya?', 'Rapat dimulai pukul 10.', history)).resolves.toMatchObject({
        answer: 'Berdasarkan transkrip, rapat dimulai pukul 10.',
        references: ['00:01 - 00:04'],
        isMock: false,
      });
      expect(fetchMock.mock.calls[0][1].body).toBe(JSON.stringify({
        question: 'Apa waktunya?',
        transcript: 'Rapat dimulai pukul 10.',
        history,
      }));
      await expect(askQuestion('Apa waktunya?', 'Rapat dimulai pukul 10.', history)).rejects.toMatchObject({
        message: 'Tanya AI belum tersedia saat LLM_PROVIDER=mock.',
        status: 503,
      });
    });

    it('exports minutes as a validated PDF and reports backend export errors', async () => {
      const minutes: MinutesData = {
        title: 'Rapat Uji',
        summary: 'Ringkasan uji.',
        discussionPoints: [],
        decisions: [],
        actionItems: [],
        openIssues: [],
        notes: [],
      };
      const fetchMock = vi.fn()
        .mockResolvedValueOnce(new Response(new Uint8Array([37, 80, 68, 70]), {
          status: 200,
          headers: { 'Content-Type': 'application/pdf' },
        }))
        .mockResolvedValueOnce(new Response(JSON.stringify({ error: 'Ekspor PDF gagal.' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }))
        .mockResolvedValueOnce(new Response('not a pdf', {
          status: 200,
          headers: { 'Content-Type': 'text/plain' },
        }));
      vi.stubGlobal('fetch', fetchMock);

      await expect(exportMinutesPdf(minutes, 'id')).resolves.toMatchObject({ type: 'application/pdf', size: 4 });
      expect(fetchMock.mock.calls[0][1].body).toBe(JSON.stringify({ minutes, language: 'id' }));
      await expect(exportMinutesPdf(minutes, 'id')).rejects.toMatchObject({
        message: 'Ekspor PDF gagal.',
        status: 500,
      });
      await expect(exportMinutesPdf(minutes, 'id')).rejects.toMatchObject({
        message: 'Format file ekspor backend bukan PDF.',
      });
    });
  });
}
