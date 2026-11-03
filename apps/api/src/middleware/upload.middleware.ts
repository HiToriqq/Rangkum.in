import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { env } from '../config/env.js';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, env.TEMP_DIR);
  },
  filename: (_req, file, cb) => {
    const randomSuffix = crypto.randomBytes(8).toString('hex');
    const ext = path.extname(file.originalname).toLowerCase() || '.tmp';
    cb(null, `upload_${Date.now()}_${randomSuffix}${ext}`);
  },
});

export const audioUpload = multer({
  storage,
  limits: {
    fileSize: env.MAX_UPLOAD_SIZE_MB * 1024 * 1024,
    files: 1,
  },
});
