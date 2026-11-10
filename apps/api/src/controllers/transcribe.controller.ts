import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { createSttProvider } from '../providers/stt/stt.factory.js';
import { TranscriptionService } from '../services/transcription.service.js';
import { downloadSafeAudioUrl } from '../services/ssrf-guard.service.js';

let transcribeService: TranscriptionService | null = null;

function getTranscribeService(): TranscriptionService {
  transcribeService ??= new TranscriptionService(createSttProvider());
  return transcribeService;
}

const UrlTranscribeSchema = z.object({
  url: z.string().url('URL audio tidak valid'),
  language: z.enum(['auto', 'id', 'en']).optional().default('auto'),
});

export async function postTranscribe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // 1. Direct URL mode
    if (req.body && req.body.url) {
      const parsed = UrlTranscribeSchema.parse(req.body);
      const service = getTranscribeService();
      const downloadedPath = await downloadSafeAudioUrl(parsed.url);

      const prompt =
        parsed.language === 'en'
          ? 'Formal meeting conversation, clear transcription of discussion and action items.'
          : 'Transkripsi percakapan dan rapat dalam Bahasa Indonesia secara akurat dan lengkap.';

      const result = await service.processAudio(
        downloadedPath,
        { language: parsed.language, prompt },
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

    const service = getTranscribeService();
    const language = (req.body.language as 'auto' | 'id' | 'en') || 'auto';

    const prompt =
      language === 'en'
        ? 'Formal meeting conversation, clear transcription of discussion and action items.'
        : 'Transkripsi percakapan dan rapat dalam Bahasa Indonesia secara akurat dan lengkap.';

    const result = await service.processAudio(
      req.file.path,
      { language, prompt },
      true // clean up multer temp file afterwards
    );

    res.json(result);
  } catch (err) {
    next(err);
  }
}
