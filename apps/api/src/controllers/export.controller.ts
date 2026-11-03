import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { MinutesSchema } from '../types/index.js';
import { generateMinutesPdf, sanitizeExportFileName } from '../services/export.service.js';

const ExportPdfSchema = z.object({
  minutes: MinutesSchema,
  language: z.enum(['id', 'en']).optional().default('id'),
});

export async function postExportPdf(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { minutes, language } = ExportPdfSchema.parse(req.body);
    const pdfBuffer = await generateMinutesPdf(minutes, language);

    const dateStr = new Date().toISOString().slice(0, 10);
    const safeTitle = sanitizeExportFileName(minutes.title).slice(0, 30);
    const fileName = `notulen-${dateStr}-${safeTitle}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
}
