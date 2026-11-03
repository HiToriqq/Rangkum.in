import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';

describe('Rangkum.in API Endpoints', () => {
  it('GET /api/health returns system status and providers', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('Rangkum.in API');
    expect(res.body.providers).toBeDefined();
  });

  it('POST /api/translate translates text between ID and EN', async () => {
    const res = await request(app)
      .post('/api/translate')
      .send({
        text: 'Selamat pagi rekan-rekan. Pertemuan ini membahas proyek.',
        targetLanguage: 'en',
      });

    expect(res.status).toBe(200);
    expect(res.body.translatedText).toBeDefined();
    expect(typeof res.body.translatedText).toBe('string');
  });

  it('POST /api/minutes/generate produces structured minutes meeting schema', async () => {
    const res = await request(app)
      .post('/api/minutes/generate')
      .send({
        transcript: 'Budi menyampaikan modul audio selesai. Siti menguji tampilan.',
        language: 'id',
      });

    expect(res.status).toBe(200);
    expect(res.body.minutes).toBeDefined();
    expect(res.body.minutes.title).toBeDefined();
    expect(res.body.minutes.summary).toBeDefined();
    expect(Array.isArray(res.body.minutes.actionItems)).toBe(true);
  });

  it('POST /api/qa/ask answers contextually from transcript', async () => {
    const res = await request(app)
      .post('/api/qa/ask')
      .send({
        question: 'Siapa yang bertanggung jawab mengerjakan tugas?',
        transcript: 'Budi ditugaskan menyelesaikan integrasi API paling lambat Jumat.',
      });

    expect(res.status).toBe(200);
    expect(res.body.answer).toBeDefined();
    expect(typeof res.body.answer).toBe('string');
  });

  it('POST /api/export/pdf generates binary PDF stream', async () => {
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
      .send({
        minutes: sampleMinutes,
        language: 'id',
      });

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('application/pdf');
    expect(res.body).toBeInstanceOf(Buffer);
  });
});
