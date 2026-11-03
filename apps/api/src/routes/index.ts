import { Router } from 'express';
import { audioUpload } from '../middleware/upload.middleware.js';
import { getHealth } from '../controllers/health.controller.js';
import { postTranscribe } from '../controllers/transcribe.controller.js';
import { postTranslate } from '../controllers/translate.controller.js';
import { postGenerateMinutes } from '../controllers/minutes.controller.js';
import { postAskQa } from '../controllers/qa.controller.js';
import { postExportPdf } from '../controllers/export.controller.js';

export const apiRouter = Router();

apiRouter.get('/health', getHealth);
apiRouter.post('/transcribe', audioUpload.single('audio'), postTranscribe);
apiRouter.post('/translate', postTranslate);
apiRouter.post('/minutes/generate', postGenerateMinutes);
apiRouter.post('/qa/ask', postAskQa);
apiRouter.post('/export/pdf', postExportPdf);
