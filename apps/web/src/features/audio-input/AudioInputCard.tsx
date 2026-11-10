import React from 'react';
import { Mic, Upload, Link2, Sparkles, Loader2, Globe } from 'lucide-react';
import { useSessionStore } from '../../store/useSessionStore';
import { RecordTab } from './RecordTab';
import { FileTab } from './FileTab';
import { LinkTab } from './LinkTab';
import { ApiRequestError, transcribeAudio } from '../../lib/api';

export const AudioInputCard: React.FC = () => {
  const {
    activeInputTab, setActiveInputTab,
    audioUrl, audioFile, audioName, audioBlob,
    sourceType, urlInput, language, setLanguage,
    isTranscribing, setIsTranscribing,
    setTranscript, setTranscriptError, setActiveResultTab,
    showToast, recordingStatus,
  } = useSessionStore();

  const hasAudioSource = activeInputTab === sourceType && Boolean(audioUrl || audioFile);
  const isRecording = recordingStatus === 'recording' || recordingStatus === 'paused';

  const handleTranscribe = async () => {
    if (!hasAudioSource) { showToast('Pilih atau rekam audio terlebih dahulu.', 'warning'); return; }
    setIsTranscribing(true);
    setTranscriptError(null);
    try {
      const request = sourceType === 'url'
        ? transcribeAudio({ type: 'url', url: urlInput, language })
        : (() => {
            const file = sourceType === 'file' ? audioFile : audioBlob;
            if (!file) throw new Error('Sumber audio tidak tersedia.');
            return transcribeAudio({ type: 'file', file, fileName: audioName || 'recording.webm', language });
          })();
      const data = await request;
      setTranscript(data.text, data.segments, data.language, data.isMock);
      setActiveResultTab('transcript');
      showToast(data.isMock ? 'Transkripsi diterima (mode simulasi).' : 'Transkripsi berhasil dibuat.', data.isMock ? 'warning' : 'success');
    } catch (err: unknown) {
      const message = err instanceof ApiRequestError || err instanceof Error ? err.message : 'Terjadi kesalahan saat menghubungi backend.';
      setTranscriptError(message);
      showToast(message, 'error');
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <div className="glass rounded-2xl overflow-hidden shadow-glass">
      {/* Header */}
      <div className="px-4 sm:px-5 py-4 border-b border-white/[0.07] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-txt-primary">Input Audio</h2>
          <p className="text-[11px] text-txt-muted mt-0.5">Pilih sumber audio</p>
        </div>
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-white/[0.05] px-2.5 py-1.5 rounded-lg border border-white/[0.08] text-[11px] text-txt-muted">
          <Globe className="w-3.5 h-3.5 text-terracotta-500 shrink-0" />
          <span className="font-medium text-txt-primary/80">Bahasa:</span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as 'auto' | 'id' | 'en')}
            className="bg-transparent text-txt-primary font-semibold focus:outline-none cursor-pointer"
          >
            <option value="auto" className="bg-bg-card">Deteksi Otomatis</option>
            <option value="id" className="bg-bg-card">Bahasa Indonesia</option>
            <option value="en" className="bg-bg-card">English</option>
          </select>
        </div>
      </div>

      {/* Input Tabs */}
      <div className="px-4 sm:px-5 pt-3">
        <div className="flex rounded-xl bg-white/[0.04] p-1 border border-white/[0.07] gap-1">
          {([
            { id: 'record', icon: <Mic className="w-3.5 h-3.5" />, label: 'Rekam' },
            { id: 'file',   icon: <Upload className="w-3.5 h-3.5" />, label: 'Import File' },
            { id: 'url',    icon: <Link2 className="w-3.5 h-3.5" />, label: 'Pakai Link' },
          ] as const).map(({ id, icon, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveInputTab(id)}
              disabled={isRecording}
              title={isRecording ? 'Selesaikan rekaman sebelum mengganti tab.' : undefined}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-[11px] sm:text-xs font-semibold transition-all duration-200 ${
                activeInputTab === id
                  ? 'bg-white/[0.09] text-txt-primary shadow-sm border border-white/[0.12]'
                  : 'text-txt-muted hover:text-txt-primary hover:bg-white/[0.04]'
              } ${isRecording ? 'cursor-not-allowed opacity-40' : ''}`}
            >
              <span className={activeInputTab === id ? 'text-terracotta-500' : 'text-txt-light'}>{icon}</span>
              <span className="whitespace-nowrap">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4 sm:p-5">
        {activeInputTab === 'record' && <RecordTab />}
        {activeInputTab === 'file' && <FileTab />}
        {activeInputTab === 'url' && <LinkTab />}

        {/* CTA */}
        <div className="mt-5 pt-4 border-t border-white/[0.07] flex flex-col gap-2.5">
          <div className="flex justify-end">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
              hasAudioSource
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-white/[0.04] text-txt-light border-white/[0.07]'
            }`}>
              {hasAudioSource ? '● Audio Siap' : '○ Menunggu Audio'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleTranscribe}
            disabled={!hasAudioSource || isTranscribing}
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold transition-all duration-200 ${
              !hasAudioSource
                ? 'bg-white/[0.04] text-txt-light border border-white/[0.07] cursor-not-allowed'
                : isTranscribing
                ? 'bg-navy-700/80 text-txt-primary cursor-wait opacity-80'
                : 'btn-primary text-white'
            }`}
          >
            {isTranscribing
              ? <><Loader2 className="w-4 h-4 animate-spin text-terracotta-400" /><span>Memproses Audio...</span></>
              : <><Sparkles className="w-4 h-4 text-terracotta-400" /><span>Transkripsikan Audio</span></>
            }
          </button>
        </div>
      </div>
    </div>
  );
};
