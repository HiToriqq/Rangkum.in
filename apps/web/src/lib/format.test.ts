import { describe, it, expect } from 'vitest';
import { formatDuration, formatBytes, sanitizeFileName } from './format';
import { validateAudioFile, validateAudioUrl } from './audio-utils';

describe('Format Utilities', () => {
  it('formats seconds into mm:ss and hh:mm:ss', () => {
    expect(formatDuration(0)).toBe('00:00');
    expect(formatDuration(45)).toBe('00:45');
    expect(formatDuration(125)).toBe('02:05');
    expect(formatDuration(3665)).toBe('01:01:05');
  });

  it('formats bytes into readable string', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(5 * 1024 * 1024)).toBe('5 MB');
  });

  it('sanitizes unsafe filenames', () => {
    expect(sanitizeFileName('notulen: 2026/10/29?.pdf')).toBe('notulen_2026_10_29_.pdf');
    expect(sanitizeFileName('clean-file_01.txt')).toBe('clean-file_01.txt');
  });
});

describe('Audio Validation', () => {
  it('rejects unsupported extensions', () => {
    const invalidFile = new File(['dummy'], 'video.mp4', { type: 'video/mp4' });
    const result = validateAudioFile(invalidFile);
    expect(result.valid).toBe(false);
  });

  it('accepts valid audio files (e.g. mp3)', () => {
    const validFile = new File(['dummy audio content'], 'recording.mp3', { type: 'audio/mpeg' });
    const result = validateAudioFile(validFile);
    expect(result.valid).toBe(true);
  });

  it('validates audio URLs and rejects non-MVP platforms with clear notice', () => {
    expect(validateAudioUrl('https://example.com/audio.mp3').valid).toBe(true);
    
    // YouTube
    const yt = validateAudioUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    expect(yt.valid).toBe(false);
    expect(yt.error).toContain('YouTube belum didukung di versi MVP');

    // Google Drive
    const gdrive = validateAudioUrl('https://drive.google.com/file/d/123/view');
    expect(gdrive.valid).toBe(false);
    expect(gdrive.error).toContain('Google Drive memerlukan autentikasi browser');

    // Zoom
    const zoom = validateAudioUrl('https://zoom.us/rec/play/xyz');
    expect(zoom.valid).toBe(false);
    expect(zoom.error).toContain('Zoom Cloud recording');
  });
});
