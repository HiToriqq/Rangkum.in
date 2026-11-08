import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { SsrfError } from '../services/ssrf-guard.service.js';
import { AudioValidationError } from '../services/audio.service.js';
import { SttProviderError } from '../providers/stt/stt-provider-error.js';
import { LlmProviderConfigurationError, LlmProviderUnavailableError } from '../providers/llm/llm-provider-error.js';

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Do NOT log transcript text or sensitive audio payload
  console.error(`[API Error] ${err.name || 'Error'}: ${err.message || 'Unknown error'}`);

  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Data masukan tidak valid.',
      details: err.errors.map((e) => ({ path: e.path.join('.'), message: e.message })),
    });
    return;
  }

  if (err instanceof SsrfError) {
    res.status(400).json({
      error: `Tautan URL ditolak: ${err.message}`,
    });
    return;
  }

  if (err instanceof AudioValidationError) {
    res.status(400).json({
      error: err.message,
    });
    return;
  }

  if (err instanceof SttProviderError) {
    res.status(err.status).json({ error: err.message });
    return;
  }

  if (err instanceof LlmProviderConfigurationError || err instanceof LlmProviderUnavailableError) {
    res.status(err.status).json({ error: err.message });
    return;
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    res.status(413).json({
      error: 'Ukuran file audio melebihi batas maksimum server.',
    });
    return;
  }

  const statusCode = err.status || err.statusCode || 500;
  const safeMessage =
    statusCode < 500
      ? err.message
      : 'Terjadi kesalahan internal pada pemrosesan server. Silakan coba lagi.';

  res.status(statusCode).json({
    error: safeMessage,
  });
}
