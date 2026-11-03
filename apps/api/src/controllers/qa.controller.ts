import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { createLlmProvider } from '../providers/llm/llm.factory.js';
import { QaService } from '../services/qa.service.js';

const qaService = new QaService(createLlmProvider());

const QaSchema = z.object({
  question: z.string().min(1, 'Pertanyaan tidak boleh kosong'),
  transcript: z.string().min(1, 'Transkrip tidak boleh kosong'),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      })
    )
    .optional()
    .default([]),
});

export async function postAskQa(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { question, transcript, history } = QaSchema.parse(req.body);
    const result = await qaService.askQuestion(question, transcript, history);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
