import React, { useState } from 'react';
import { Link2, CheckCircle2, AlertCircle, Info, ExternalLink } from 'lucide-react';
import { useSessionStore } from '../../store/useSessionStore';
import { validateAudioUrl } from '../../lib/audio-utils';
import { AudioPlayer } from './AudioPlayer';

export const LinkTab: React.FC = () => {
  const {
    urlInput,
    urlError,
    audioUrl,
    setUrlInput,
    setUrlError,
    setAudioFromUrl,
    clearAudio,
    showToast,
  } = useSessionStore();

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
      {/* Notice about direct audio URLs vs V2 platforms */}
      <div className="flex items-start gap-2.5 p-3 rounded-lg bg-navy-50/70 border border-navy-100 text-navy-800 text-xs">
        <Info className="w-4 h-4 text-navy-600 mt-0.5 shrink-0" />
        <div className="leading-relaxed">
          <p className="font-semibold text-navy-900">Direct Audio URL (MVP)</p>
          <p className="text-txt-muted mt-0.5">
            Mendukung tautan file publik berakhiran audio langsung (misalnya <code className="bg-bg-surface px-1 py-0.5 rounded text-navy-800 font-mono text-[11px]">.mp3</code>, <code className="bg-bg-surface px-1 py-0.5 rounded text-navy-800 font-mono text-[11px]">.wav</code>, <code className="bg-bg-surface px-1 py-0.5 rounded text-navy-800 font-mono text-[11px]">.ogg</code>).
            Tautan YouTube, Google Drive, dan Zoom Cloud direncanakan pada rilis <strong>V2</strong>.
          </p>
        </div>
      </div>

      {/* URL Input Form */}
      <form onSubmit={handleApplyUrl} className="flex flex-col gap-2">
        <label htmlFor="audio-url-input" className="text-xs font-semibold text-navy-800">
          Tautan File Audio
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-txt-muted">
              <Link2 className="w-4 h-4" />
            </div>
            <input
              id="audio-url-input"
              type="url"
              placeholder="https://domain-anda.com/audio/diskusi-mingguan.mp3"
              value={urlInput}
              onChange={(e) => {
                setUrlInput(e.target.value);
                setTestedValid(false);
              }}
              className={`w-full pl-9 pr-8 py-2.5 bg-bg-surface text-xs sm:text-sm text-navy-800 placeholder-txt-muted/60 rounded-xl border transition-colors focus:outline-none ${
                urlError
                  ? 'border-red-300 focus:border-red-500 ring-1 ring-red-200'
                  : 'border-border focus:border-terracotta-500'
              }`}
            />
            {urlInput && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-txt-muted hover:text-navy-800"
                title="Hapus input"
              >
                ×
              </button>
            )}
          </div>

          <button
            type="submit"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-white text-xs sm:text-sm font-semibold transition-colors active:scale-95 shrink-0"
          >
            <span>Verifikasi Tautan</span>
          </button>
        </div>
      </form>

      {/* Error Message */}
      {urlError && (
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
          <p className="flex-1">{urlError}</p>
        </div>
      )}

      {/* Success preview player */}
      {testedValid && audioUrl && !urlError && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Tautan siap diproses</span>
          </div>
          <AudioPlayer src={audioUrl} title={`Tautan: ${urlInput}`} />
        </div>
      )}
    </div>
  );
};
