import type { SttProvider, SttOptions } from '../providers/stt/stt.provider.js';
import type { TranscriptionResult } from '../types/index.js';
import {
  validateAudioMagicBytes,
  normalizeAudioWithFfmpeg,
  safeDeleteFiles,
  AudioValidationError,
} from './audio.service.js';

export class TranscriptionService {
  private sttProvider: SttProvider;

  constructor(sttProvider: SttProvider) {
    this.sttProvider = sttProvider;
  }

  async processAudio(
    initialFilePath: string,
    options?: SttOptions,
    cleanInitialFile = true
  ): Promise<TranscriptionResult> {
    let normalizedPath: string | null = null;

    try {
      // 1. Magic bytes validation
      const isValidMagic = await validateAudioMagicBytes(initialFilePath);
      if (!isValidMagic) {
        throw new AudioValidationError(
          'File yang diunggah bukan format audio yang valid (header audio tidak dikenali).'
        );
      }

      // 2. Normalize to mono 16 kHz WAV via ffmpeg
      normalizedPath = await normalizeAudioWithFfmpeg(initialFilePath);

      // 3. Transcribe via SttProvider
      const result = await this.sttProvider.transcribe(normalizedPath, options);
      return result;
    } finally {
      // 4. Always clean up temporary files in finally block
      const filesToDelete = [normalizedPath];
      if (cleanInitialFile) {
        filesToDelete.push(initialFilePath);
      }
      await safeDeleteFiles(filesToDelete);
    }
  }
}
