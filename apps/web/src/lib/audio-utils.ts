export const SUPPORTED_AUDIO_EXTENSIONS = ['.mp3', '.wav', '.m4a', '.webm', '.ogg', '.flac', '.aac'];

export const SUPPORTED_AUDIO_MIMES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/wave',
  'audio/webm',
  'audio/ogg',
  'audio/m4a',
  'audio/mp4',
  'audio/x-m4a',
  'audio/aac',
  'audio/flac',
  'audio/x-flac',
];

export const MAX_AUDIO_SIZE_MB = 50;
export const MAX_AUDIO_SIZE_BYTES = MAX_AUDIO_SIZE_MB * 1024 * 1024;
export const MAX_RECORD_DURATION_SEC = 7200; // 2 hours default

/**
 * Detect the best supported audio mime type for MediaRecorder in the current browser
 */
export function getSupportedMimeType(): string {
  if (typeof MediaRecorder === 'undefined') {
    return 'audio/webm';
  }

  const types = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/ogg;codecs=opus',
    'audio/wav',
  ];

  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }

  return '';
}

/**
 * Validate selected or dropped audio file
 */
export function validateAudioFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'File tidak ditemukan' };
  }

  // Check file size
  if (file.size > MAX_AUDIO_SIZE_BYTES) {
    return {
      valid: false,
      error: `Ukuran file (${(file.size / (1024 * 1024)).toFixed(1)} MB) melebihi batas maksimum ${MAX_AUDIO_SIZE_MB} MB.`,
    };
  }

  if (file.size === 0) {
    return { valid: false, error: 'File audio kosong (0 byte).' };
  }

  // Check extension
  const fileName = file.name.toLowerCase();
  const hasValidExt = SUPPORTED_AUDIO_EXTENSIONS.some((ext) => fileName.endsWith(ext));

  // Check MIME type if present
  const hasValidMime = !file.type || SUPPORTED_AUDIO_MIMES.includes(file.type.toLowerCase()) || file.type.startsWith('audio/');

  if (!hasValidExt && !hasValidMime) {
    return {
      valid: false,
      error: `Format file tidak didukung. Harap gunakan format: ${SUPPORTED_AUDIO_EXTENSIONS.join(', ')}`,
    };
  }

  return { valid: true };
}

/**
 * Validate direct public audio URL
 */
export function validateAudioUrl(urlStr: string): { valid: boolean; error?: string } {
  if (!urlStr || !urlStr.trim()) {
    return { valid: false, error: 'Masukkan URL audio langsung.' };
  }

  let parsed: URL;
  try {
    parsed = new URL(urlStr.trim());
  } catch {
    return { valid: false, error: 'Format URL tidak valid. Pastikan diawali dengan http:// atau https://' };
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { valid: false, error: 'Hanya protokol HTTP atau HTTPS yang diizinkan.' };
  }

  // Disallow user credentials
  if (parsed.username || parsed.password) {
    return { valid: false, error: 'URL tidak boleh mengandung username atau password.' };
  }

  const hostname = parsed.hostname.toLowerCase();

  // Explicit check for non-MVP platforms
  if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
    return {
      valid: false,
      error: 'Link YouTube belum didukung di versi MVP karena kebijakan ToS. Gunakan direct audio URL atau unduh audio terlebih dahulu.',
    };
  }

  if (hostname.includes('drive.google.com')) {
    return {
      valid: false,
      error: 'Google Drive memerlukan autentikasi browser. Harap unduh file audio terlebih dahulu lalu gunakan tab "Import File".',
    };
  }

  if (hostname.includes('zoom.us') || hostname.includes('zoomgov.com')) {
    return {
      valid: false,
      error: 'Zoom Cloud recording memerlukan token rapat. Fitur ini dijadwalkan untuk versi V2.',
    };
  }

  return { valid: true };
}
