import React, { useState } from 'react';
import { Globe, Copy, Check, RotateCcw, Sparkles, Loader2, Languages, FileText } from 'lucide-react';
import { useSessionStore } from '../../store/useSessionStore';

export const TranslationTab: React.FC = () => {
  const {
    editedTranscript,
    translations,
    activeTargetLang,
    setActiveTargetLang,
    setTranslation,
    isTranslating,
    setIsTranslating,
    setTranslationError,
    showToast,
  } = useSessionStore();

  const [copied, setCopied] = useState(false);
  const [activeView, setActiveView] = useState<'translated' | 'original'>('translated');

  const currentTranslation = translations[activeTargetLang] || '';

  const handleTranslate = async () => {
    if (!editedTranscript.trim()) {
      showToast('Transkrip masih kosong. Buat transkrip terlebih dahulu.', 'warning');
      return;
    }

    setIsTranslating(true);
    setTranslationError(null);

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: editedTranscript,
          targetLanguage: activeTargetLang,
        }),
      }).catch(() => null);

      if (!response || !response.ok) {
        setTranslationError(
          'Layanan terjemahan backend belum terhubung (POST /api/translate). Fitur terjemahan AI akan aktif pada tahap backend berikutnya.'
        );
        showToast('Backend terjemahan belum aktif.', 'info');
      } else {
        const data = await response.json();
        setTranslation(activeTargetLang, data.translatedText);
        showToast(`Terjemahan ke ${activeTargetLang === 'id' ? 'Bahasa Indonesia' : 'English'} selesai.`, 'success');
      }
    } catch (err: unknown) {
      const error = err as Error;
      setTranslationError(error.message || 'Gagal menerjemahkan teks');
      showToast('Gagal menerjemahkan teks.', 'error');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleCopy = async () => {
    const textToCopy = activeView === 'translated' ? currentTranslation : editedTranscript;
    if (!textToCopy) return;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      showToast('Teks berhasil disalin ke clipboard.', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Gagal menyalin teks.', 'error');
    }
  };

  if (!editedTranscript.trim()) {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center text-txt-muted">
        <div className="w-12 h-12 rounded-xl bg-bg-base border border-border flex items-center justify-center text-txt-muted mb-3">
          <Languages className="w-6 h-6 text-terracotta-600/70" />
        </div>
        <h3 className="text-sm sm:text-base font-bold text-navy-800">
          Belum Ada Transkrip untuk Diterjemahkan
        </h3>
        <p className="mt-1 text-xs text-txt-muted max-w-sm">
          Selesaikan transkripsi audio terlebih dahulu sebelum menerjemahkan antara Bahasa Indonesia dan English.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Controls & Options Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border">
        {/* Language Target Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-navy-800">Target Bahasa:</span>
          <div className="flex rounded-lg bg-bg-subtle p-0.5 border border-border text-xs">
            <button
              type="button"
              onClick={() => setActiveTargetLang('id')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                activeTargetLang === 'id'
                  ? 'bg-bg-surface text-navy-800 shadow-sm font-semibold'
                  : 'text-txt-muted hover:text-navy-800'
              }`}
            >
              Indonesia (ID)
            </button>
            <button
              type="button"
              onClick={() => setActiveTargetLang('en')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                activeTargetLang === 'en'
                  ? 'bg-bg-surface text-navy-800 shadow-sm font-semibold'
                  : 'text-txt-muted hover:text-navy-800'
              }`}
            >
              English (EN)
            </button>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Switch display mode between translated and original for comparison */}
          {currentTranslation && (
            <div className="flex rounded-lg bg-bg-subtle p-0.5 border border-border text-xs">
              <button
                type="button"
                onClick={() => setActiveView('translated')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  activeView === 'translated'
                    ? 'bg-bg-surface text-navy-800 shadow-sm'
                    : 'text-txt-muted'
                }`}
              >
                Terjemahan
              </button>
              <button
                type="button"
                onClick={() => setActiveView('original')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  activeView === 'original'
                    ? 'bg-bg-surface text-navy-800 shadow-sm'
                    : 'text-txt-muted'
                }`}
              >
                Transkrip Asli
              </button>
            </div>
          )}

          {currentTranslation && (
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-navy-800 hover:bg-bg-subtle border border-border transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin' : 'Salin'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleTranslate}
            disabled={isTranslating}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-terracotta-600 hover:bg-terracotta-700 transition-colors shadow-sm active:scale-95 disabled:opacity-60"
          >
            {isTranslating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Menerjemahkan...</span>
              </>
            ) : (
              <>
                {currentTranslation ? <RotateCcw className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>{currentTranslation ? 'Terjemahkan Ulang' : 'Terjemahkan Sekarang'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Body */}
      {currentTranslation ? (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px] text-txt-muted">
            <span>
              {activeView === 'translated'
                ? `Hasil Terjemahan (${activeTargetLang === 'id' ? 'Bahasa Indonesia' : 'English'}):`
                : 'Teks Transkrip Sumber (Tidak tertimpa):'}
            </span>
            <span className="font-mono">
              {(activeView === 'translated' ? currentTranslation : editedTranscript).split(/\s+/).length} kata
            </span>
          </div>

          <div className="w-full p-4 bg-bg-surface text-xs sm:text-sm text-navy-900 leading-relaxed rounded-xl border border-border min-h-[300px] whitespace-pre-wrap font-sans shadow-sm">
            {activeView === 'translated' ? currentTranslation : editedTranscript}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center border-2 border-dashed border-border rounded-xl bg-bg-base/30">
          <Globe className="w-8 h-8 text-terracotta-600 mb-2" />
          <h4 className="text-sm font-bold text-navy-800">
            Siap Menerjemahkan ke {activeTargetLang === 'id' ? 'Bahasa Indonesia' : 'English'}
          </h4>
          <p className="mt-1 text-xs text-txt-muted max-w-sm">
            Klik tombol <strong>"Terjemahkan Sekarang"</strong> di atas. Transkrip asli Anda akan tetap utuh tanpa risiko tertimpa.
          </p>
        </div>
      )}
    </div>
  );
};
