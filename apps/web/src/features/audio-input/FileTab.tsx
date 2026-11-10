import React, { useState, useRef } from 'react';
import { Upload, FileAudio, X, AlertCircle } from 'lucide-react';
import { useSessionStore } from '../../store/useSessionStore';
import { formatBytes } from '../../lib/format';
import { validateAudioFile, SUPPORTED_AUDIO_EXTENSIONS, MAX_AUDIO_SIZE_MB } from '../../lib/audio-utils';
import { AudioPlayer } from './AudioPlayer';

export const FileTab: React.FC = () => {
  const { audioFile, audioUrl, setAudioFromFile, clearAudio, showToast } = useSessionStore();
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
  };

  const handleRemove = () => {
    clearAudio(); setFileError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    showToast('File telah dihapus.', 'info');
  };

  return (
    <div className="flex flex-col gap-4">
      {fileError && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl text-xs"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
          <div className="flex-1 text-red-300">
            <p className="font-semibold">Format File Ditolak</p>
            <p className="mt-0.5 text-red-400/80">{fileError}</p>
          </div>
        </div>
      )}

      {!audioFile ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click(); } }}
          role="button" tabIndex={0} aria-label="Pilih atau seret file audio"
          className="flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all"
          style={{
            borderColor: isDragging ? 'rgba(185,104,75,0.6)' : 'rgba(255,255,255,0.1)',
            background: isDragging ? 'rgba(185,104,75,0.08)' : 'rgba(255,255,255,0.03)',
          }}
        >
          <input ref={fileInputRef} type="file" accept={SUPPORTED_AUDIO_EXTENSIONS.join(',')}
            onChange={(e) => { if (e.target.files?.[0]) processFile(e.target.files[0]); e.currentTarget.value = ''; }}
            onClick={(e) => e.stopPropagation()} className="hidden" />

          <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
            style={{ background: 'rgba(185,104,75,0.12)', border: '1px solid rgba(185,104,75,0.25)' }}>
            <Upload className="w-5 h-5 text-terracotta-400" />
          </div>
          <p className="text-xs sm:text-sm font-semibold text-white/70 text-center">
            Seret dan lepas file audio, atau <span className="text-terracotta-400 underline">pilih file</span>
          </p>
          <p className="mt-1.5 text-[11px] text-white/30 text-center">
            MP3, WAV, M4A, WebM, OGG, FLAC, AAC · Maks. {MAX_AUDIO_SIZE_MB} MB
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between p-3.5 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}>
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: 'rgba(185,104,75,0.12)', border: '1px solid rgba(185,104,75,0.2)' }}>
                <FileAudio className="w-5 h-5 text-terracotta-400" />
              </div>
              <div className="truncate">
                <p className="text-xs sm:text-sm font-semibold text-white/80 truncate" title={audioFile.name}>{audioFile.name}</p>
                <p className="text-[11px] text-white/35">{formatBytes(audioFile.size)} · {audioFile.name.split('.').pop()?.toUpperCase()}</p>
              </div>
            </div>
            <button type="button" onClick={handleRemove}
              className="p-1.5 text-white/30 hover:text-red-400 rounded-lg transition-colors ml-2 shrink-0"
              title="Hapus file">
              <X className="w-4 h-4" />
            </button>
          </div>
          {audioUrl && <AudioPlayer src={audioUrl} title={`Pratinjau: ${audioFile.name}`} />}
        </div>
      )}
    </div>
  );
};
