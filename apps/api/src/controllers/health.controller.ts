import type { Request, Response } from 'express';
import { env } from '../config/env.js';

export function getHealth(_req: Request, res: Response): void {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Rangkum.in API',
    providers: {
      stt: env.STT_PROVIDER,
      sttConfigured:
        env.STT_PROVIDER === 'mock' ||
        (env.STT_PROVIDER === 'groq' && Boolean(env.GROQ_API_KEY?.trim())) ||
        (env.STT_PROVIDER === 'openai' && Boolean(env.OPENAI_API_KEY?.trim())),
      llm: env.LLM_PROVIDER,
      llmConfigured:
        env.LLM_PROVIDER === 'mock' ||
        (env.LLM_PROVIDER === 'groq' && Boolean(env.GROQ_API_KEY?.trim())) ||
        (env.LLM_PROVIDER === 'openai' && Boolean(env.OPENAI_API_KEY?.trim())),
    },
  });
}
