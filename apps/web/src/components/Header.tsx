import React from 'react';
import { RotateCcw } from 'lucide-react';
import { useSessionStore } from '../store/useSessionStore';
import { ApiStatus } from './ApiStatus';

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
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href="#" className="flex items-center gap-3 group focus:outline-none">
            <div className="relative w-10 h-10 flex items-center justify-center transition-transform duration-300 group-hover:-translate-y-0.5">
              <img src="/icon.svg" alt="Rangkum.in Icon" className="w-full h-full object-contain drop-shadow-sm group-hover:scale-[1.03] transition-all duration-300 ease-out" />
            </div>

            <div className="flex flex-col justify-center">
              <div className="flex items-center tracking-tight font-extrabold text-[20px] text-navy-800 group-hover:text-navy-900 transition-colors leading-none mb-1">
                Rangkum<span className="text-terracotta-600 drop-shadow-sm group-hover:text-terracotta-500 transition-colors">.in</span>
              </div>
              <span className="text-[9px] uppercase font-bold tracking-[0.2em] text-txt-muted/80 group-hover:text-terracotta-600/80 transition-colors">
                Voice to Minutes AI
              </span>
            </div>
          </a>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <ApiStatus />
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-bg-base border border-border text-xs font-medium text-txt-muted">
            <span className={`w-2 h-2 rounded-full ${hasActiveData ? 'bg-terracotta-600 animate-pulse' : 'bg-emerald-500'}`} />
            {hasActiveData ? 'Sesi Aktif' : 'Sesi Baru'}
          </div>

          <button type="button" onClick={handleNewSession} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg text-navy-800 bg-bg-subtle hover:bg-border/70 border border-border transition-colors focus:ring-2 focus:ring-terracotta-500 focus:outline-none active:scale-[0.98]" title="Bersihkan sesi dan mulai dari awal">
            <RotateCcw className="w-3.5 h-3.5 text-txt-muted" />
            <span className="hidden min-[360px]:inline">Sesi Baru</span>
          </button>
        </div>
      </div>
    </header>
  );
};
