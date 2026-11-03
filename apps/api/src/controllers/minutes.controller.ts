import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { createLlmProvider } from '../providers/llm/llm.factory.js';
import { MinutesService } from '../services/minutes.service.js';

const minutesService = new MinutesService(createLlmProvider());

const GenerateMinutesSchema = z.object({
  transcript: z.string().min(1, 'Transkrip tidak boleh kosong'),
  language: z.enum(['id', 'en']).optional().default('id'),
});

export async function postGenerateMinutes(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { transcript, language } = GenerateMinutesSchema.parse(req.body);
    const minutes = await minutesService.createMinutes(transcript, language);
    res.json({ minutes });
  } catch (err) {
    next(err);
  }
}
