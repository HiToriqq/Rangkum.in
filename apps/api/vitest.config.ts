import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    includeSource: ['src/**/*.ts'],
    env: {
      NODE_ENV: 'test',
      STT_PROVIDER: 'mock',
      LLM_PROVIDER: 'mock',
      GROQ_API_KEY: '',
      OPENAI_API_KEY: '',
      GEMINI_API_KEY: '',
    },
  },
});
