import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/Rangkum.in/' : '/',
  define: {
    'import.meta.vitest': process.env.NODE_ENV === 'test' ? 'true' : 'undefined',
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  test: {
    includeSource: ['src/**/*.ts', 'src/**/*.tsx'],
  },
} as Parameters<typeof defineConfig>[0] & { test?: unknown });
