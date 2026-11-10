import React, { useState } from 'react';
import { Globe, Copy, Check, RotateCcw, Sparkles, Loader2, Languages, AlertCircle } from 'lucide-react';
import { useSessionStore } from '../../store/useSessionStore';
import { ApiRequestError, translateTranscript } from '../../lib/api';

export const TranslationTab: React.FC = () => {
  const {
    editedTranscript, translations, activeTargetLang, setActiveTargetLang,
    setTranslation, isTranslating, translationError, setIsTranslating, setTranslationError, showToast,
  } = useSessionStore();

  const [copied, setCopied] = useState(false);
  const [activeView, setActiveView] = useState<'translated' | 'original'>('translated');
  const currentTranslation = translations[activeTargetLang] || '';

  const handleTranslate = async () => {
    const sourceText = editedTranscript;
    if (!sourceText.trim()) { showToast('Transkrip masih kosong.', 'warning'); return; }
    setIsTranslating(true); setTranslationError(null);
    try {
      const data = await translateTranscript(sourceText, activeTargetLang);
      if (useSessionStore.getState().editedTranscript !== sourceText) return;
      setTranslation(activeTargetLang, data.translatedText, data.isMock);
      showToast(data.isMock ? 'Terjemahan diterima (mode simulasi).' : `Terjemahan ke ${activeTargetLang === 'id' ? 'Bahasa Indonesia' : 'English'} selesai.`, data.isMock ? 'warning' : 'success');
    } catch (err: unknown) {
      const message = err instanceof ApiRequestError || err instanceof Error ? err.message : 'Kesalahan layanan terjemahan.';
      setTranslationError(message); showToast(message, 'error');
    } finally { setIsTranslating(false); }
  };

  const handleCopy = async () => {
    const text = activeView === 'translated' ? currentTranslation : editedTranscript;
    if (!text) return;
    try { await navigator.clipboard.writeText(text); setCopied(true); showToast('Teks disalin.', 'success'); setTimeout(() => setCopied(false), 2000); }
    catch { showToast('Gagal menyalin.', 'error'); }
  };

  if (!editedTranscript.trim()) {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
          style={{ background: 'rgba(185,104,75,0.1)', border: '1px solid rgba(185,104,75,0.2)' }}>
          <Languages className="w-6 h-6 text-terracotta-400" />
        </div>
        <h3 className="text-sm font-bold text-white/70">Belum Ada Transkrip untuk Diterjemahkan</h3>
        <p className="mt-1.5 text-xs text-white/40 max-w-sm">Selesaikan transkripsi audio terlebih dahulu.</p>
      </div>
    );
  }

  const btnBase = "inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all";
  const btnGhost = `${btnBase} text-white/60 hover:text-white/90`;

  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        {/* Language switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-white/50">Target:</span>
          <div className="flex rounded-lg p-0.5 text-xs"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {(['id', 'en'] as const).map((lang) => (
              <button key={lang} type="button" onClick={() => setActiveTargetLang(lang)}
                className={`px-3 py-1 rounded-md font-semibold transition-all ${activeTargetLang === lang ? 'text-white/90' : 'text-white/35 hover:text-white/60'}`}
                style={activeTargetLang === lang ? { background: 'rgba(255,255,255,0.09)' } : {}}>
                {lang === 'id' ? 'Indonesia' : 'English'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {currentTranslation && (
            <div className="flex rounded-lg p-0.5 text-xs mr-1"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              {(['translated', 'original'] as const).map((v) => (
                <button key={v} type="button" onClick={() => setActiveView(v)}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${activeView === v ? 'text-white/90' : 'text-white/35 hover:text-white/60'}`}
                  style={activeView === v ? { background: 'rgba(255,255,255,0.09)' } : {}}>
                  {v === 'translated' ? 'Terjemahan' : 'Asli'}
                </button>
              ))}
            </div>
          )}
          {currentTranslation && (
            <button type="button" onClick={handleCopy}
              className={btnGhost} style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)' }}>
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin' : 'Salin'}</span>
            </button>
          )}
          <button type="button" onClick={handleTranslate} disabled={isTranslating}
            className="btn-primary inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-60">
            {isTranslating
              ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /><span>Menerjemahkan...</span></>
              : <>{currentTranslation ? <RotateCcw className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}<span>{currentTranslation ? 'Terjemahkan Ulang' : 'Terjemahkan Sekarang'}</span></>
            }
          </button>
        </div>
      </div>

      {translationError && (
        <div className="flex items-start gap-2 p-3 rounded-xl text-xs text-red-300"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }} role="alert">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-400" /><p>{translationError}</p>
        </div>
      )}

      {currentTranslation ? (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px] text-white/30">
            <span>{activeView === 'translated' ? `Hasil Terjemahan (${activeTargetLang === 'id' ? 'Bahasa Indonesia' : 'English'}):` : 'Teks Transkrip Sumber:'}</span>
            <span className="font-mono">{(activeView === 'translated' ? currentTranslation : editedTranscript).split(/\s+/).length} kata</span>
          </div>
          <div className="w-full p-4 text-xs sm:text-sm text-white/75 leading-relaxed rounded-xl min-h-[300px] whitespace-pre-wrap font-sans"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {activeView === 'translated' ? currentTranslation : editedTranscript}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-xl"
          style={{ border: '2px dashed rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
          <Globe className="w-8 h-8 text-terracotta-500 mb-2" />
          <h4 className="text-sm font-bold text-white/60">Siap Menerjemahkan ke {activeTargetLang === 'id' ? 'Bahasa Indonesia' : 'English'}</h4>
          <p className="mt-1 text-xs text-white/35 max-w-sm">
            Klik <strong className="text-white/50">"Terjemahkan Sekarang"</strong>. Transkrip asli tetap utuh.
          </p>
        </div>
      )}
    </div>
  );
};
