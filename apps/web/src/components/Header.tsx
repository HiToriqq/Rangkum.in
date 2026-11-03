import React from 'react';
import { RotateCcw, Sparkles } from 'lucide-react';
import { useSessionStore } from '../store/useSessionStore';

export const Header: React.FC = () => {
  const {
    audioUrl,
    hasTranscript,
    minutesData,
    resetSession,
    showConfirmModal,
    showToast,
  } = useSessionStore();

  const hasActiveData = Boolean(audioUrl || hasTranscript || minutesData);

  const handleNewSession = () => {
    if (hasActiveData) {
      showConfirmModal({
        title: 'Mulai Sesi Baru?',
        message: 'Semua rekaman, transkrip, dan notulen pada sesi ini akan dibersihkan dari browser. Pastikan Anda telah menyalin atau mengunduh hasil yang diperlukan.',
        confirmLabel: 'Mulai Sesi Baru',
        cancelLabel: 'Batalkan',
        isDestructive: true,
        onConfirm: () => {
          resetSession();
          showToast('Sesi baru telah dimulai.', 'info');
        },
      });
    } else {
      resetSession();
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-bg-surface/90 backdrop-blur-md border-b border-border transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <a href="#" className="flex items-center gap-2.5 group focus:outline-none">
            <div className="w-9 h-9 rounded-lg bg-navy-800 flex items-center justify-center shadow-card group-hover:bg-navy-700 transition-colors">
              <img src="/icon.svg" alt="Rangkum.in Icon" className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center tracking-tight font-bold text-lg text-navy-800 leading-tight">
                Rangkum<span className="text-terracotta-600">.in</span>
              </div>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-txt-muted -mt-0.5">
                Voice to Minutes AI
              </span>
            </div>
          </a>
        </div>

        {/* Right Session Status & Action */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-bg-base border border-border text-xs font-medium text-txt-muted">
            <span
              className={`w-2 h-2 rounded-full ${
                hasActiveData ? 'bg-terracotta-600 animate-pulse' : 'bg-emerald-500'
              }`}
            />
            {hasActiveData ? 'Sesi Aktif' : 'Siap Digunakan'}
          </div>

          <button
            type="button"
            onClick={handleNewSession}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg text-navy-800 bg-bg-subtle hover:bg-border/70 border border-border transition-colors focus:ring-2 focus:ring-terracotta-500 focus:outline-none active:scale-[0.98]"
            title="Bersihkan sesi dan mulai dari awal"
          >
            <RotateCcw className="w-3.5 h-3.5 text-txt-muted" />
            <span className="hidden xs:inline">Sesi Baru</span>
          </button>
        </div>
      </div>
    </header>
  );
};
