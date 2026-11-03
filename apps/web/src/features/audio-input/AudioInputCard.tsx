import React from 'react';
import { Mic, Upload, Link2, Sparkles, Loader2, Globe, AlertCircle, ShieldCheck } from 'lucide-react';
import { useSessionStore } from '../../store/useSessionStore';
import { RecordTab } from './RecordTab';
import { FileTab } from './FileTab';
import { LinkTab } from './LinkTab';

export const AudioInputCard: React.FC = () => {
  const {
    activeInputTab,
    setActiveInputTab,
    audioUrl,
    audioFile,
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
  } = useSessionStore();

  const hasAudioSource = Boolean(audioUrl || audioFile);

  const handleTranscribe = async () => {
    if (!hasAudioSource) {
      showToast('Pilih atau rekam audio terlebih dahulu.', 'warning');
      return;
    }

    setIsTranscribing(true);
    setTranscriptError(null);

    try {
      // In Task 02, we attempt to call the API endpoint.
      // If backend is not yet started, we show a transparent and honest status notice.
      const formData = new FormData();
      if (sourceType === 'file' && audioFile) {
        formData.append('audio', audioFile);
      } else if (sourceType === 'record' && audioFile) {
        formData.append('audio', audioFile);
      } else if (sourceType === 'record' && useSessionStore.getState().audioBlob) {
        const blob = useSessionStore.getState().audioBlob!;
        formData.append('audio', blob, 'recording.webm');
      } else if (sourceType === 'url') {
        formData.append('url', urlInput);
      }
      formData.append('language', language);

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: sourceType === 'url' ? JSON.stringify({ url: urlInput, language }) : formData,
        headers: sourceType === 'url' ? { 'Content-Type': 'application/json' } : undefined,
      }).catch(() => null);

      if (!response || !response.ok) {
        // Backend not running or endpoint not yet deployed
        setTranscriptError(
          'Layanan backend API belum terhubung (POST /api/transcribe). Sesuai roadmap, integrasi AI backend akan dikerjakan pada tahap berikutnya.'
        );
        showToast('Backend API belum terhubung. Tahap UI & interaksi siap.', 'info');
      } else {
        const data = await response.json();
        setTranscript(data.text, data.segments, data.language, data.isMock);
        setActiveResultTab('transcript');
        showToast('Transkripsi berhasil dibuat!', 'success');
      }
    } catch (err: unknown) {
      const error = err as Error;
      setTranscriptError(error.message || 'Gagal memproses audio');
      showToast('Gagal memproses transkrip.', 'error');
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <div className="bg-bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
      {/* Top Header & Tab Navigation */}
      <div className="p-4 sm:p-5 border-b border-border bg-bg-base/30">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-navy-800">
              Input Audio
            </h2>
            <p className="text-xs text-txt-muted">
              Pilih metode penyediaan rekaman suara atau audio diskusi
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
        <div className="mt-4 flex rounded-xl bg-bg-subtle p-1 border border-border/80">
          <button
            type="button"
            onClick={() => setActiveInputTab('record')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeInputTab === 'record'
                ? 'bg-bg-surface text-navy-800 shadow-sm'
                : 'text-txt-muted hover:text-navy-800'
            }`}
          >
            <Mic className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-terracotta-600" />
            <span>Rekam Suara</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveInputTab('file')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeInputTab === 'file'
                ? 'bg-bg-surface text-navy-800 shadow-sm'
                : 'text-txt-muted hover:text-navy-800'
            }`}
          >
            <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-navy-600" />
            <span>Import File</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveInputTab('url')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeInputTab === 'url'
                ? 'bg-bg-surface text-navy-800 shadow-sm'
                : 'text-txt-muted hover:text-navy-800'
            }`}
          >
            <Link2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-navy-600" />
            <span>Gunakan Link</span>
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
          <div className="flex items-center justify-between text-xs text-txt-muted">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Audio dikirim ke provider AI terenkripsi</span>
            </span>
            <span className="font-mono text-[11px]">
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
