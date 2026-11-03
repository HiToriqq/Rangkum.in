import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { createLlmProvider } from '../providers/llm/llm.factory.js';
import { TranslationService } from '../services/translation.service.js';

const translationService = new TranslationService(createLlmProvider());

const TranslateSchema = z.object({
  text: z.string().min(1, 'Teks tidak boleh kosong'),
  targetLanguage: z.enum(['id', 'en']),
});

export async function postTranslate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { text, targetLanguage } = TranslateSchema.parse(req.body);
    const translatedText = await translationService.translateTranscript(text, targetLanguage);
    res.json({ translatedText, targetLanguage });
  } catch (err) {
    next(err);
  }
}
