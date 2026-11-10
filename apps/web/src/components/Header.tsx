import React from 'react';
import { RotateCcw } from 'lucide-react';
import { useSessionStore } from '../store/useSessionStore';
import { ApiStatus } from './ApiStatus';

export const Header: React.FC = () => {
  const { audioUrl, hasTranscript, minutesData, resetSession, showConfirmModal, showToast } = useSessionStore();
  const hasActiveData = Boolean(audioUrl || hasTranscript || minutesData);

  const handleNewSession = () => {
    if (hasActiveData) {
      showConfirmModal({
        title: 'Mulai Sesi Baru?',
        message: 'Semua rekaman, transkrip, dan notulen pada sesi ini akan dibersihkan dari browser.',
        confirmLabel: 'Mulai Sesi Baru',
        cancelLabel: 'Batalkan',
        isDestructive: true,
        onConfirm: () => { resetSession(); showToast('Sesi baru telah dimulai.', 'info'); },
      });
    } else {
      resetSession();
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full">
      {/* Glass bar */}
      <div className="glass-strong border-b border-white/[0.07]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3 group focus:outline-none shrink-0">
            <div className="w-9 h-9 rounded-xl overflow-hidden transition-all duration-200 group-hover:scale-105"
              style={{ boxShadow: '0 0 18px rgba(185,104,75,0.3), 0 0 0 1px rgba(185,104,75,0.2)' }}>
              <img src="/icon.svg" alt="Rangkum.in" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-extrabold text-[17px] tracking-tight text-white/90">
                Rangkum<span className="text-terracotta-400">.in</span>
              </span>
              <span className="text-[9px] uppercase font-bold tracking-[0.18em] text-white/25 mt-0.5">
                Voice to Minutes AI
              </span>
            </div>
          </a>

          {/* Right */}
          <div className="flex items-center gap-2 sm:gap-3">
            <ApiStatus />

            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-[11px] font-medium text-txt-muted">
              <span className={`w-1.5 h-1.5 rounded-full ${hasActiveData ? 'bg-terracotta-500 animate-pulse' : 'bg-emerald-500'}`} />
              {hasActiveData ? 'Sesi Aktif' : 'Siap'}
            </div>

            <button
              type="button"
              onClick={handleNewSession}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] sm:text-xs font-semibold rounded-lg text-txt-muted bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] hover:border-white/[0.15] transition-all focus:outline-none active:scale-[0.97]"
              title="Bersihkan sesi dan mulai dari awal"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden min-[360px]:inline">Sesi Baru</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
