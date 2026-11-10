import React, { useState } from 'react';
import { Link2, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useSessionStore } from '../../store/useSessionStore';
import { validateAudioUrl } from '../../lib/audio-utils';
import { AudioPlayer } from './AudioPlayer';

export const LinkTab: React.FC = () => {
  const { urlInput, urlError, audioUrl, setUrlInput, setUrlError, setAudioFromUrl, clearAudio, showToast } = useSessionStore();
  const [testedValid, setTestedValid] = useState(false);

  const handleApplyUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateAudioUrl(urlInput);
    if (!validation.valid) {
      setUrlError(validation.error || 'URL tidak valid');
      setTestedValid(false);
      showToast(validation.error || 'URL audio tidak valid.', 'error');
      return;
    }
    setUrlError(null);
    setAudioFromUrl(urlInput.trim());
    setTestedValid(true);
    showToast('Tautan audio berhasil diverifikasi.', 'success');
  };

  const handleClear = () => {
    setUrlInput('');
    setUrlError(null);
    setTestedValid(false);
    clearAudio();
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Info notice */}
      <div className="flex items-start gap-2.5 p-3 rounded-xl text-xs"
        style={{ background: 'rgba(185,104,75,0.08)', border: '1px solid rgba(185,104,75,0.2)' }}>
        <Info className="w-4 h-4 text-terracotta-400 mt-0.5 shrink-0" />
        <div className="leading-relaxed">
          <p className="font-semibold text-terracotta-300">Direct Audio URL (MVP)</p>
          <p className="text-white/40 mt-0.5">
            Mendukung tautan file publik berakhiran audio langsung (misalnya{' '}
            <code className="px-1 py-0.5 rounded text-terracotta-300 font-mono text-[11px]" style={{ background: 'rgba(185,104,75,0.15)' }}>.mp3</code>,{' '}
            <code className="px-1 py-0.5 rounded text-terracotta-300 font-mono text-[11px]" style={{ background: 'rgba(185,104,75,0.15)' }}>.wav</code>,{' '}
            <code className="px-1 py-0.5 rounded text-terracotta-300 font-mono text-[11px]" style={{ background: 'rgba(185,104,75,0.15)' }}>.ogg</code>).
            Tautan YouTube, Google Drive, dan Zoom Cloud direncanakan pada rilis <strong className="text-white/60">V2</strong>.
          </p>
        </div>
      </div>

      {/* URL Input */}
      <form onSubmit={handleApplyUrl} className="flex flex-col gap-2">
        <label htmlFor="audio-url-input" className="text-xs font-semibold text-white/60">
          Tautan File Audio
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Link2 className="w-4 h-4 text-white/30" />
            </div>
            <input
              id="audio-url-input"
              type="url"
              placeholder="https://domain-anda.com/audio/diskusi-mingguan.mp3"
              value={urlInput}
              onChange={(e) => { setUrlInput(e.target.value); setTestedValid(false); }}
              className={`w-full pl-9 pr-8 py-2.5 text-xs sm:text-sm text-white/90 placeholder-white/20 rounded-xl transition-all focus:outline-none ${
                urlError
                  ? 'ring-1 ring-red-500/50'
                  : 'focus:ring-1 focus:ring-terracotta-500/50'
              }`}
              style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${urlError ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.1)'}` }}
            />
            {urlInput && (
              <button type="button" onClick={handleClear}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/30 hover:text-white/70 transition-colors"
                title="Hapus input">×</button>
            )}
          </div>
          <button type="submit"
            className="btn-primary inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-white text-xs sm:text-sm font-semibold shrink-0">
            Verifikasi Tautan
          </button>
        </div>
      </form>

      {/* Error */}
      {urlError && (
        <div className="flex items-start gap-2 p-2.5 rounded-xl text-xs"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
          <p className="flex-1 text-red-300">{urlError}</p>
        </div>
      )}

      {/* Success */}
      {testedValid && audioUrl && !urlError && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Tautan siap diproses</span>
          </div>
          <AudioPlayer src={audioUrl} title={`Tautan: ${urlInput}`} />
        </div>
      )}
    </div>
  );
};
