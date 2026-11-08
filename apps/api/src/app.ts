import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { apiRouter } from './routes/index.js';
import { errorHandler } from './middleware/error-handler.middleware.js';

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      const localDevelopmentOrigin =
        env.NODE_ENV !== 'production' && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin || '');

      if (!origin || origin === env.CORS_ORIGIN || localDevelopmentOrigin) {
        callback(null, true);
      } else {
        callback(Object.assign(new Error('Origin tidak diizinkan oleh kebijakan CORS'), { status: 403 }));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api', apiRouter);

// Global Error Handler
app.use(errorHandler);

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest;

  describe('Rangkum.in API Endpoints', () => {
    it('GET /api/health returns system status and providers', async () => {
      const request = (await import('supertest')).default;
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.service).toBe('Rangkum.in API');
      expect(res.body.providers).toBeDefined();
      expect(typeof res.body.providers.sttConfigured).toBe('boolean');
    });

    it('allows the local Vite loopback origin during development', async () => {
      const request = (await import('supertest')).default;
      const res = await request(app)
        .get('/api/health')
        .set('Origin', 'http://127.0.0.1:5173');

      expect(res.status).toBe(200);
      expect(res.headers['access-control-allow-origin']).toBe('http://127.0.0.1:5173');
    });

    it('rejects origins outside the configured/local development origins', async () => {
      const request = (await import('supertest')).default;
      const res = await request(app)
        .get('/api/health')
        .set('Origin', 'https://not-local.example');

      expect(res.status).toBe(403);
    });

    it('POST /api/transcribe rejects an upload that is not audio', async () => {
      const request = (await import('supertest')).default;
      const res = await request(app)
        .post('/api/transcribe')
        .field('language', 'auto')
        .attach('audio', Buffer.from('not an audio stream'), {
          filename: 'recording.mp3',
          contentType: 'audio/mpeg',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('header audio tidak dikenali');
    });

    it('POST /api/transcribe validates direct URL input before downloading', async () => {
      const request = (await import('supertest')).default;
      const res = await request(app)
        .post('/api/transcribe')
        .send({ url: 'not a URL', language: 'auto' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Data masukan tidak valid.');
    });

    it('POST /api/translate marks simulated translations', async () => {
      const request = (await import('supertest')).default;
      const res = await request(app)
        .post('/api/translate')
        .send({
          text: 'Selamat pagi rekan-rekan. Pertemuan ini membahas proyek.',
          targetLanguage: 'en',
        });

      expect(res.status).toBe(200);
      expect(res.body.translatedText).toBeDefined();
      expect(typeof res.body.translatedText).toBe('string');
      expect(res.body.isMock).toBe(true);
      expect(res.body.translatedText).toContain('[Simulasi]');
    });

    it('POST /api/translate rejects whitespace-only text', async () => {
      const request = (await import('supertest')).default;
      const res = await request(app)
        .post('/api/translate')
        .send({ text: '   ', targetLanguage: 'en' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Data masukan tidak valid.');
    });

    it('POST /api/minutes/generate does not return fabricated minutes in mock mode', async () => {
      const request = (await import('supertest')).default;
      const res = await request(app)
        .post('/api/minutes/generate')
        .send({
          transcript: 'Budi menyampaikan modul audio selesai. Siti menguji tampilan.',
          language: 'id',
        });

      expect(res.status).toBe(503);
      expect(res.body.error).toContain('LLM_PROVIDER=mock');
      expect(res.body.minutes).toBeUndefined();
    });

    it('POST /api/qa/ask does not return fabricated answers in mock mode', async () => {
      const request = (await import('supertest')).default;
      const res = await request(app)
        .post('/api/qa/ask')
        .send({
          question: 'Siapa yang bertanggung jawab mengerjakan tugas?',
          transcript: 'Budi ditugaskan menyelesaikan integrasi API paling lambat Jumat.',
        });

      expect(res.status).toBe(503);
      expect(res.body.error).toContain('LLM_PROVIDER=mock');
      expect(res.body.answer).toBeUndefined();
    });

    it('POST /api/qa/ask rejects whitespace-only questions', async () => {
      const request = (await import('supertest')).default;
      const res = await request(app)
        .post('/api/qa/ask')
        .send({ question: '   ', transcript: 'Ada transkrip.' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Data masukan tidak valid.');
    });

    it('POST /api/export/pdf generates a valid PDF attachment', async () => {
      const request = (await import('supertest')).default;
      const sampleMinutes = {
        title: 'Notulen Uji Coba',
        summary: 'Ringkasan singkat pertemuan pengujian sistem.',
        discussionPoints: ['Poin pengujian 1', 'Poin pengujian 2'],
        decisions: ['Disepakati deployment staging'],
        actionItems: [{ task: 'Testing', owner: 'Budi', dueDate: 'Jumat' }],
        openIssues: [],
        notes: [],
      };
      const res = await request(app)
        .post('/api/export/pdf')
        .send({ minutes: sampleMinutes, language: 'id' });

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('application/pdf');
      expect(res.headers['content-disposition']).toContain('attachment; filename="notulen-');
      expect(res.body).toBeInstanceOf(Buffer);
      expect(res.body.subarray(0, 4).toString()).toBe('%PDF');
    });

    it('POST /api/export/pdf rejects invalid minutes data', async () => {
      const request = (await import('supertest')).default;
      const res = await request(app)
        .post('/api/export/pdf')
        .send({ minutes: { title: '', summary: 'Ringkasan' }, language: 'id' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Data masukan tidak valid.');
    });
  });
}
