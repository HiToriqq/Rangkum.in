import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { createSttProvider } from '../providers/stt/stt.factory.js';
import { TranscriptionService } from '../services/transcription.service.js';
import { downloadSafeAudioUrl } from '../services/ssrf-guard.service.js';

const transcribeService = new TranscriptionService(createSttProvider());

const UrlTranscribeSchema = z.object({
  url: z.string().url('URL audio tidak valid'),
  language: z.enum(['auto', 'id', 'en']).optional().default('auto'),
});

export async function postTranscribe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // 1. Direct URL mode
    if (req.body && req.body.url) {
      const parsed = UrlTranscribeSchema.parse(req.body);
      const downloadedPath = await downloadSafeAudioUrl(parsed.url);

      const result = await transcribeService.processAudio(
        downloadedPath,
        { language: parsed.language },
        true // delete downloaded file afterwards
      );

      res.json(result);
      return;
    }

    // 2. Multipart Upload mode
    if (!req.file) {
      res.status(400).json({ error: 'Tidak ada file audio atau URL yang diberikan.' });
      return;
    }

    const language = (req.body.language as 'auto' | 'id' | 'en') || 'auto';

    const result = await transcribeService.processAudio(
      req.file.path,
      { language },
      true // clean up multer temp file afterwards
    );

    res.json(result);
  } catch (err) {
    next(err);
  }
}
