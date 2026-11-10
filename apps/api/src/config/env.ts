import dotenv from 'dotenv';
import path from 'path';
import os from 'os';
import { z } from 'zod';

// Load .env from monorepo root or local directory
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

const envSchema = z.object({
  PORT: z.string().default('3001').transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  
  // AI Provider choices
  STT_PROVIDER: z.enum(['mock', 'groq', 'openai']).default('mock'),
  LLM_PROVIDER: z.enum(['mock', 'groq', 'openai', 'gemini']).default('mock'),
  
  // Provider API Keys
  GROQ_API_KEY: z.string().optional(),
  GROQ_LLM_MODEL: z.string().default('openai/gpt-oss-120b'),
  OPENAI_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),

  // Limits
  MAX_UPLOAD_SIZE_MB: z.string().default('50').transform((val) => parseInt(val, 10)),
  MAX_AUDIO_DURATION_SEC: z.string().default('7200').transform((val) => parseInt(val, 10)),
  TEMP_DIR: z.string().default(os.tmpdir()),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Konfigurasi Environment tidak valid:', parsed.error.format());
  throw new Error('Konfigurasi Environment tidak valid.');
}

export const env = parsed.data;
