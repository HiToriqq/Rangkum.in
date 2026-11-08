import type { MinutesData } from '../types';
import { getAudioFileExtension, validateAudioFile, validateAudioUrl } from './audio-utils';

/**
 * Format duration in seconds to mm:ss or hh:mm:ss
 */
export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const totalSecs = Math.floor(seconds);
  const hrs = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;

  const paddedMins = String(mins).padStart(2, '0');
  const paddedSecs = String(secs).padStart(2, '0');

  if (hrs > 0) {
    const paddedHrs = String(hrs).padStart(2, '0');
    return `${paddedHrs}:${paddedMins}:${paddedSecs}`;
  }
  return `${paddedMins}:${paddedSecs}`;
}

/**
 * Format file size in bytes to human-readable string
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Sanitize filename to avoid invalid characters for file downloads
 */
export function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9_\-\.]/g, '_').replace(/_+/g, '_');
}

export function formatMinutesAsText(
  minutes: MinutesData,
  language: 'id' | 'en' = 'id',
  date = new Date()
): string {
  const isEnglish = language === 'en';
  const labels = isEnglish
    ? {
        minutes: 'MEETING MINUTES',
        date: 'Date',
        summary: 'EXECUTIVE SUMMARY',
        discussion: 'DISCUSSION POINTS',
        decisions: 'DECISIONS',
        actions: 'ACTION ITEMS',
        owner: 'Owner',
        due: 'Due',
        issues: 'OPEN ISSUES',
        notes: 'NOTES',
        none: 'None',
      }
    : {
        minutes: 'NOTULEN RAPAT',
        date: 'Tanggal',
        summary: 'RINGKASAN EKSEKUTIF',
        discussion: 'POIN PEMBAHASAN',
        decisions: 'KEPUTUSAN',
        actions: 'TINDAK LANJUT',
        owner: 'PIC',
        due: 'Tenggat',
        issues: 'ISU TERBUKA',
        notes: 'CATATAN',
        none: 'Tidak ada',
      };
  const formatList = (items: string[]) => items.length
    ? items.map((item, index) => `${index + 1}. ${item}`).join('\n')
    : `- ${labels.none}`;
  const actionItems = minutes.actionItems.length
    ? minutes.actionItems.map((item, index) =>
        `${index + 1}. ${item.task} — ${labels.owner}: ${item.owner} | ${labels.due}: ${item.dueDate}`
      ).join('\n')
    : `- ${labels.none}`;

  return [
    `${labels.minutes}: ${minutes.title}`,
    `${labels.date}: ${date.toLocaleDateString(isEnglish ? 'en-US' : 'id-ID', { dateStyle: 'long' })}`,
    '',
    `${labels.summary}:`,
    minutes.summary,
    '',
    `${labels.discussion}:`,
    formatList(minutes.discussionPoints),
    '',
    `${labels.decisions}:`,
    formatList(minutes.decisions),
    '',
    `${labels.actions}:`,
    actionItems,
    '',
    `${labels.issues}:`,
    formatList(minutes.openIssues),
    '',
    `${labels.notes}:`,
    formatList(minutes.notes),
  ].join('\n');
}

/**
 * Download a plain text file directly from browser
 */
export function downloadTextFile(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  downloadBlobFile(filename, blob);
}

export function downloadBlobFile(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = sanitizeFileName(filename);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest;

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

    it('formats all meeting minutes sections for TXT export in both languages', () => {
      const minutes: MinutesData = {
        title: 'Rapat Tim',
        summary: 'Membahas jadwal rilis.',
        discussionPoints: ['Kesiapan fitur'],
        decisions: ['Rilis hari Jumat'],
        actionItems: [{ task: 'Uji build', owner: 'Ayu', dueDate: 'Kamis' }],
        openIssues: [],
        notes: ['Periksa kembali log.'],
      };

      const indonesian = formatMinutesAsText(minutes, 'id', new Date('2026-11-08T00:00:00Z'));
      expect(indonesian).toContain('NOTULEN RAPAT: Rapat Tim');
      expect(indonesian).toContain('Membahas jadwal rilis.');
      expect(indonesian).toContain('1. Uji build — PIC: Ayu | Tenggat: Kamis');
      expect(indonesian).toContain('ISU TERBUKA:\n- Tidak ada');
      expect(indonesian).toContain('CATATAN:\n1. Periksa kembali log.');

      const english = formatMinutesAsText(minutes, 'en', new Date('2026-11-08T00:00:00Z'));
      expect(english).toContain('MEETING MINUTES: Rapat Tim');
      expect(english).toContain('ACTION ITEMS:');
      expect(english).toContain('Owner: Ayu | Due: Kamis');
      expect(english).toContain('OPEN ISSUES:\n- None');
    });
  });

  describe('Audio Validation', () => {
      it('rejects unsupported extensions', () => {
        const invalidFile = new File(['dummy'], 'video.mp4', { type: 'video/mp4' });
        expect(validateAudioFile(invalidFile).valid).toBe(false);
      });

      it('accepts valid audio files (e.g. mp3)', () => {
        const validFile = new File(['dummy audio content'], 'recording.mp3', { type: 'audio/mpeg' });
        expect(validateAudioFile(validFile).valid).toBe(true);
      });

      it('rejects empty files and unsupported media types', () => {
        const emptyFile = new File([], 'empty.wav', { type: 'audio/wav' });
        const mislabeledVideo = new File(['video'], 'recording.wav', { type: 'video/mp4' });

        expect(validateAudioFile(emptyFile)).toMatchObject({
          valid: false,
          error: 'File audio kosong (0 byte).',
        });
        expect(validateAudioFile(mislabeledVideo).valid).toBe(false);
      });

      it('accepts a supported audio MIME type with a generic binary extension', () => {
        const audio = new File(['audio'], 'recording.bin', { type: 'audio/mpeg' });
        expect(validateAudioFile(audio).valid).toBe(true);
      });

      it('rejects a video MIME type even when the filename uses an audio extension', () => {
        const mislabeledFile = new File(['video content'], 'recording.mp3', { type: 'video/mp4' });
        expect(validateAudioFile(mislabeledFile).valid).toBe(false);
      });

      it('maps recorded MIME types to matching filename extensions', () => {
        expect(getAudioFileExtension('audio/webm;codecs=opus')).toBe('webm');
        expect(getAudioFileExtension('audio/mp4')).toBe('m4a');
      });

      it('validates audio URLs and rejects unsupported platforms with clear notice', () => {
        expect(validateAudioUrl('https://example.com/audio.mp3').valid).toBe(true);

        const youtube = validateAudioUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
        expect(youtube.valid).toBe(false);
        expect(youtube.error).toContain('YouTube belum didukung di versi MVP');

        const drive = validateAudioUrl('https://drive.google.com/file/d/123/view');
        expect(drive.valid).toBe(false);
        expect(drive.error).toContain('Google Drive memerlukan autentikasi browser');

        const zoom = validateAudioUrl('https://zoom.us/rec/play/xyz');
        expect(zoom.valid).toBe(false);
        expect(zoom.error).toContain('Zoom Cloud recording');
      });

      it('rejects URL credentials and non-HTTP schemes', () => {
        expect(validateAudioUrl('ftp://example.com/audio.wav')).toMatchObject({
          valid: false,
          error: 'Hanya protokol HTTP atau HTTPS yang diizinkan.',
        });
        expect(validateAudioUrl('https://user:pass@example.com/audio.wav')).toMatchObject({
          valid: false,
          error: 'URL tidak boleh mengandung username atau password.',
        });
      });
  });
}
