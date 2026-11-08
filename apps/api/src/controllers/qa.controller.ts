import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { createLlmProvider } from '../providers/llm/llm.factory.js';
import { QaService } from '../services/qa.service.js';

let qaService: QaService | null = null;

function getQaService(): QaService {
  qaService ??= new QaService(createLlmProvider());
  return qaService;
}

const QaSchema = z.object({
  question: z.string().trim().min(1, 'Pertanyaan tidak boleh kosong').max(4_000, 'Pertanyaan melebihi batas maksimum.'),
  transcript: z.string().trim().min(1, 'Transkrip tidak boleh kosong').max(200_000, 'Transkrip melebihi batas maksimum.'),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().max(4_000),
      })
    )
    .max(20)
    .optional()
    .default([]),
});

export async function postAskQa(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { question, transcript, history } = QaSchema.parse(req.body);
    const service = getQaService();
    const result = await service.askQuestion(question, transcript, history);
    res.json({ ...result, isMock: service.isMock });
  } catch (err) {
    next(err);
  }
}
