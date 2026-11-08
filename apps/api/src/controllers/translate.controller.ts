import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { createLlmProvider } from '../providers/llm/llm.factory.js';
import { TranslationService } from '../services/translation.service.js';

let translationService: TranslationService | null = null;

function getTranslationService(): TranslationService {
  translationService ??= new TranslationService(createLlmProvider());
  return translationService;
}

const TranslateSchema = z.object({
  text: z.string().trim().min(1, 'Teks tidak boleh kosong').max(200_000, 'Teks melebihi batas maksimum.'),
  targetLanguage: z.enum(['id', 'en']),
});

export async function postTranslate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { text, targetLanguage } = TranslateSchema.parse(req.body);
    const service = getTranslationService();
    const translatedText = await service.translateTranscript(text, targetLanguage);
    if (!translatedText.trim()) {
      throw new Error('Provider terjemahan mengembalikan hasil kosong.');
    }
    res.json({ translatedText, targetLanguage, isMock: service.isMock });
  } catch (err) {
    next(err);
  }
}
