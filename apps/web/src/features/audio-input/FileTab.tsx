import React, { useState, useRef } from 'react';
import { Upload, FileAudio, X, AlertCircle } from 'lucide-react';
import { useSessionStore } from '../../store/useSessionStore';
import { formatBytes } from '../../lib/format';
import {
  validateAudioFile,
  SUPPORTED_AUDIO_EXTENSIONS,
  MAX_AUDIO_SIZE_MB,
} from '../../lib/audio-utils';
import { AudioPlayer } from './AudioPlayer';

export const FileTab: React.FC = () => {
  const {
    audioFile,
    audioUrl,
    setAudioFromFile,
    clearAudio,
    showToast,
  } = useSessionStore();

  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const processFile = (file: File) => {
    setFileError(null);
    const validation = validateAudioFile(file);
    if (!validation.valid) {
      setFileError(validation.error || 'File tidak valid.');
      showToast(validation.error || 'File audio tidak valid.', 'error');
      return;
    }

    setAudioFromFile(file);
    showToast(`File "${file.name}" berhasil dimuat.`, 'success');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    clearAudio();
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    showToast('File telah dihapus.', 'info');
  };

  return (
    <div className="flex flex-col gap-4">
      {/* File validation error */}
      {fileError && (
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm">
          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold">Format File Ditolak</p>
            <p className="mt-0.5">{fileError}</p>
          </div>
        </div>
      )}

      {/* Upload Dropzone or File Card */}
      {!audioFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center p-6 sm:p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
            isDragging
              ? 'border-terracotta-500 bg-terracotta-50/50 scale-[0.99]'
              : 'border-border hover:border-terracotta-400 bg-bg-base/40 hover:bg-bg-base/80'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={SUPPORTED_AUDIO_EXTENSIONS.join(',')}
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="w-12 h-12 rounded-full bg-bg-surface border border-border shadow-card flex items-center justify-center text-navy-800 mb-3">
            <Upload className="w-5 h-5 text-terracotta-600" />
          </div>

          <p className="text-xs sm:text-sm font-semibold text-navy-800 text-center">
            Seret dan lepas file audio di sini, atau <span className="text-terracotta-600 underline">pilih file</span>
          </p>

          <p className="mt-1 text-[11px] text-txt-muted text-center">
            Format didukung: MP3, WAV, M4A, WebM, OGG, FLAC, AAC (Maks. {MAX_AUDIO_SIZE_MB} MB)
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {/* File Information Card */}
          <div className="flex items-center justify-between p-3.5 bg-bg-surface rounded-xl border border-border shadow-card">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-lg bg-navy-50 flex items-center justify-center text-navy-800 shrink-0">
                <FileAudio className="w-5 h-5 text-terracotta-600" />
              </div>
              <div className="truncate">
                <p className="text-xs sm:text-sm font-semibold text-navy-800 truncate" title={audioFile.name}>
                  {audioFile.name}
                </p>
                <p className="text-[11px] text-txt-muted">
                  {formatBytes(audioFile.size)} • {audioFile.name.split('.').pop()?.toUpperCase()}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRemove}
              className="p-1.5 text-txt-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-2 shrink-0"
              title="Ganti atau hapus file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Audio Preview */}
          {audioUrl && (
            <AudioPlayer src={audioUrl} title={`Pratinjau: ${audioFile.name}`} />
          )}
        </div>
      )}
    </div>
  );
};
