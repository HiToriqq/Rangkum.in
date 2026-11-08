import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { createLlmProvider } from '../providers/llm/llm.factory.js';
import { MinutesService } from '../services/minutes.service.js';

let minutesService: MinutesService | null = null;

function getMinutesService(): MinutesService {
  minutesService ??= new MinutesService(createLlmProvider());
  return minutesService;
}

const GenerateMinutesSchema = z.object({
  transcript: z.string().trim().min(1, 'Transkrip tidak boleh kosong').max(200_000, 'Transkrip melebihi batas maksimum.'),
  language: z.enum(['id', 'en']).optional().default('id'),
});

export async function postGenerateMinutes(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { transcript, language } = GenerateMinutesSchema.parse(req.body);
    const service = getMinutesService();
    const minutes = await service.createMinutes(transcript, language);
    res.json({ minutes, isMock: service.isMock });
  } catch (err) {
    next(err);
  }
}
