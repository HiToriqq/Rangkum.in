import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { apiRouter } from './routes/index.js';
import { errorHandler } from './middleware/error-handler.middleware.js';

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman) or matching CORS_ORIGIN
      if (!origin || origin === env.CORS_ORIGIN || origin.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        callback(new Error('Origin tidak diizinkan oleh kebijakan CORS'));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api', apiRouter);

// Global Error Handler
app.use(errorHandler);
