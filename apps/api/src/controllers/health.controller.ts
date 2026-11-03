import type { Request, Response } from 'express';
import { env } from '../config/env.js';

export function getHealth(_req: Request, res: Response): void {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Rangkum.in API',
    providers: {
      stt: env.STT_PROVIDER,
      llm: env.LLM_PROVIDER,
    },
  });
}
