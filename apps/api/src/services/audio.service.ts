import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { spawn } from 'child_process';
import { env } from '../config/env.js';

export class AudioValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AudioValidationError';
  }
}

/**
 * Check magic bytes to verify audio container/stream
 */
export async function validateAudioMagicBytes(filePath: string): Promise<boolean> {
  const handle = await fs.promises.open(filePath, 'r');
  const buffer = Buffer.alloc(32);
  await handle.read(buffer, 0, 32, 0);
  await handle.close();

  // MP3 ID3 tag: 49 44 33
  if (buffer[0] === 0x49 && buffer[1] === 0x44 && buffer[2] === 0x33) return true;

  // MP3 Sync frame: FF FB or FF F3 or FF F2
  if (buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0) return true;

  // WAV: RIFF....WAVE
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x41 &&
    buffer[10] === 0x56 &&
    buffer[11] === 0x45
  ) {
    return true;
  }

  // OGG: OggS
  if (buffer[0] === 0x4f && buffer[1] === 0x67 && buffer[2] === 0x67 && buffer[3] === 0x53) {
    return true;
  }

  // FLAC: fLaC
  if (buffer[0] === 0x66 && buffer[1] === 0x4c && buffer[2] === 0x61 && buffer[3] === 0x43) {
    return true;
  }

  // WebM / EBML: 1A 45 DF A3
  if (buffer[0] === 0x1a && buffer[1] === 0x45 && buffer[2] === 0xdf && buffer[3] === 0xa3) {
    return true;
  }

  // M4A / MP4: 'ftyp' at offset 4
  if (buffer[4] === 0x66 && buffer[5] === 0x74 && buffer[6] === 0x79 && buffer[7] === 0x70) {
    return true;
  }

  return false;
}

/**
 * Convert audio file to mono, 16 kHz PCM WAV using ffmpeg
 */
export async function normalizeAudioWithFfmpeg(
  inputPath: string,
  destFolder = env.TEMP_DIR
): Promise<string> {
  const randomSuffix = crypto.randomBytes(8).toString('hex');
  const outputPath = path.join(destFolder, `norm_${Date.now()}_${randomSuffix}.wav`);

  return new Promise((resolve, reject) => {
    // ffmpeg -y -i <input> -vn -af highpass=f=80,loudnorm=I=-16:TP=-1.5:LRA=11,aresample=16000 -acodec pcm_s16le -ac 1 -ar 16000 <output>
    const args = [
      '-y',
      '-i', inputPath,
      '-vn',
      '-af', 'highpass=f=80,loudnorm=I=-16:TP=-1.5:LRA=11,aresample=16000',
      '-acodec', 'pcm_s16le',
      '-ac', '1',
      '-ar', '16000',
      outputPath,
    ];

    const child = spawn('ffmpeg', args);

    let stderr = '';
    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0 && fs.existsSync(outputPath)) {
        resolve(outputPath);
      } else {
        reject(
          new AudioValidationError(
            `Gagal menormalisasi format audio dengan ffmpeg (exit code ${code}). Format audio mungkin rusak.`
          )
        );
      }
    });

    child.on('error', (err) => {
      reject(new Error(`Gagal mengeksekusi ffmpeg: ${err.message}`));
    });
  });
}

/**
 * Delete one or multiple temp files safely
 */
export async function safeDeleteFiles(filePaths: (string | undefined | null)[]): Promise<void> {
  for (const p of filePaths) {
    if (p && fs.existsSync(p)) {
      try {
        await fs.promises.unlink(p);
      } catch {
        // Ignore deletion errors for temporary cleanup
      }
    }
  }
}
