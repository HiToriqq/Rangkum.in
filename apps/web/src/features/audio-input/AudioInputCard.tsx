import React from 'react';
import { Mic, Upload, Link2, Sparkles, Loader2, Globe } from 'lucide-react';
import { useSessionStore } from '../../store/useSessionStore';
import { RecordTab } from './RecordTab';
import { FileTab } from './FileTab';
import { LinkTab } from './LinkTab';
import { ApiRequestError, transcribeAudio } from '../../lib/api';

export const AudioInputCard: React.FC = () => {
  const {
    activeInputTab,
    setActiveInputTab,
    audioUrl,
    audioFile,
    audioName,
    audioBlob,
    sourceType,
    urlInput,
    language,
    setLanguage,
    isTranscribing,
    setIsTranscribing,
    setTranscript,
    setTranscriptError,
    setActiveResultTab,
    showToast,
    recordingStatus,
  } = useSessionStore();

  const hasAudioSource = activeInputTab === sourceType && Boolean(audioUrl || audioFile);
  const isRecording = recordingStatus === 'recording' || recordingStatus === 'paused';

  const handleTranscribe = async () => {
    if (!hasAudioSource) {
      showToast('Pilih atau rekam audio terlebih dahulu.', 'warning');
      return;
    }

    setIsTranscribing(true);
    setTranscriptError(null);

    try {
      const request = sourceType === 'url'
        ? transcribeAudio({ type: 'url', url: urlInput, language })
        : (() => {
            const file = sourceType === 'file' ? audioFile : audioBlob;
            if (!file) throw new Error('Sumber audio tidak tersedia. Pilih file atau rekam audio kembali.');
            return transcribeAudio({
              type: 'file',
              file,
              fileName: audioName || 'recording.webm',
              language,
            });
          })();

      const data = await request;
      setTranscript(data.text, data.segments, data.language, data.isMock);
      setActiveResultTab('transcript');
      if (data.isMock) {
        showToast('Transkripsi diterima (mode simulasi).', 'warning');
      } else {
        showToast('Transkripsi berhasil dibuat.', 'success');
      }
    } catch (err: unknown) {
      const message = err instanceof ApiRequestError || err instanceof Error
        ? err.message
        : 'Terjadi kesalahan saat menghubungi backend.';
      setTranscriptError(message);
      showToast(message, 'error');
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <div className="bg-bg-surface rounded-xl sm:rounded-2xl border border-border shadow-card overflow-hidden">
      {/* Top Header & Tab Navigation */}
      <div className="p-4 sm:p-5 border-b border-border bg-bg-base/30">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-navy-800">
              Input Audio
            </h2>
            <p className="text-xs text-txt-muted">
              Pilih sumber audio
            </p>
          </div>

          {/* Language selector for STT */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto bg-bg-surface px-2.5 py-1 rounded-lg border border-border shadow-sm text-xs text-txt-muted">
            <Globe className="w-3.5 h-3.5 text-terracotta-600" />
            <span className="font-medium text-navy-800">Bahasa:</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'auto' | 'id' | 'en')}
              className="bg-transparent text-navy-800 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="auto">Deteksi Otomatis</option>
              <option value="id">Bahasa Indonesia</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        {/* 3 Tabs */}
        <div className="mt-4 flex rounded-lg sm:rounded-xl bg-bg-subtle p-1 border border-border/80">
          <button
            type="button"
            onClick={() => setActiveInputTab('record')}
            disabled={isRecording}
            title={isRecording ? 'Selesaikan rekaman sebelum mengganti tab.' : undefined}
            className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2 px-1.5 sm:px-3 rounded-md sm:rounded-lg text-[11px] sm:text-sm font-semibold transition-all ${
            activeInputTab === 'record'
              ? 'bg-bg-surface text-navy-800 shadow-sm'
              : 'text-txt-muted hover:text-navy-800'
            } ${isRecording ? 'cursor-not-allowed opacity-60' : ''}`}
          >
            <Mic className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-terracotta-600" />
            <span className="whitespace-nowrap">Rekam</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveInputTab('file')}
            disabled={isRecording}
            title={isRecording ? 'Selesaikan rekaman sebelum mengganti tab.' : undefined}
            className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2 px-1.5 sm:px-3 rounded-md sm:rounded-lg text-[11px] sm:text-sm font-semibold transition-all ${
            activeInputTab === 'file'
              ? 'bg-bg-surface text-navy-800 shadow-sm'
              : 'text-txt-muted hover:text-navy-800'
            } ${isRecording ? 'cursor-not-allowed opacity-60' : ''}`}
          >
            <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-navy-600" />
            <span className="whitespace-nowrap">Import File</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveInputTab('url')}
            disabled={isRecording}
            title={isRecording ? 'Selesaikan rekaman sebelum mengganti tab.' : undefined}
            className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2 px-1.5 sm:px-3 rounded-md sm:rounded-lg text-[11px] sm:text-sm font-semibold transition-all ${
            activeInputTab === 'url'
              ? 'bg-bg-surface text-navy-800 shadow-sm'
              : 'text-txt-muted hover:text-navy-800'
            } ${isRecording ? 'cursor-not-allowed opacity-60' : ''}`}
          >
            <Link2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-navy-600" />
            <span className="whitespace-nowrap">Pakai Link</span>
          </button>
        </div>
      </div>

      {/* Tab Content Body */}
      <div className="p-4 sm:p-6">
        {activeInputTab === 'record' && <RecordTab />}
        {activeInputTab === 'file' && <FileTab />}
        {activeInputTab === 'url' && <LinkTab />}

        {/* Processing CTA Area */}
        <div className="mt-6 pt-5 border-t border-border flex flex-col gap-3">
          <div className="flex items-center justify-end text-xs text-txt-muted">
            <span className="self-start rounded-md bg-bg-base px-2 py-1 font-mono text-[11px] sm:self-auto">
              {hasAudioSource ? 'Audio Siap' : 'Menunggu Audio'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleTranscribe}
            disabled={!hasAudioSource || isTranscribing}
            className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all shadow-md active:scale-[0.99] ${
              !hasAudioSource
                ? 'bg-bg-subtle text-txt-muted border border-border cursor-not-allowed shadow-none'
                : isTranscribing
                ? 'bg-navy-700 text-white cursor-wait opacity-90'
                : 'bg-navy-800 hover:bg-navy-700 text-white hover:shadow-hover'
            }`}
          >
            {isTranscribing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-terracotta-400" />
                <span>Memproses Audio...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-terracotta-400" />
                <span>Transkripsikan Audio</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
