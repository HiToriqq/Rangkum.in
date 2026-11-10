import React from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { AudioInputCard } from './features/audio-input/AudioInputCard';
import { ResultWorkspace } from './features/workspace/ResultWorkspace';
import { Toast } from './components/Toast';
import { ConfirmModal } from './components/ConfirmModal';

export const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-scene flex flex-col relative overflow-x-hidden">

      {/* ── Wave background image ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: 0 }}>
        <img
          src="/wave-bg.png"
          alt=""
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '100%',
            minWidth: 1200,
            opacity: 0.13,
            mixBlendMode: 'screen',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        />
      </div>

      {/* ── Ambient orbs ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: 0 }}>
        {/* Top-left warm orb */}
        <div style={{
          position: 'absolute', width: 700, height: 700, borderRadius: '50%',
          background: 'radial-gradient(circle at center, rgba(185,104,75,0.55) 0%, rgba(185,104,75,0.15) 40%, transparent 70%)',
          top: -200, left: -150,
          animation: 'orbFloat 20s ease-in-out infinite',
          filter: 'blur(1px)',
        }} />
        {/* Bottom-right blue orb */}
        <div style={{
          position: 'absolute', width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle at center, rgba(59,130,246,0.35) 0%, rgba(59,130,246,0.08) 45%, transparent 70%)',
          bottom: -150, right: -100,
          animation: 'orbFloat 26s ease-in-out infinite reverse',
          filter: 'blur(1px)',
        }} />
        {/* Mid purple accent */}
        <div style={{
          position: 'absolute', width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle at center, rgba(139,92,246,0.28) 0%, rgba(139,92,246,0.06) 50%, transparent 70%)',
          top: '35%', right: '18%',
          animation: 'orbFloat 16s ease-in-out infinite 5s',
          filter: 'blur(1px)',
        }} />
        {/* Small terracotta accent */}
        <div style={{
          position: 'absolute', width: 250, height: 250, borderRadius: '50%',
          background: 'radial-gradient(circle at center, rgba(212,132,90,0.4) 0%, transparent 70%)',
          top: '60%', left: '30%',
          animation: 'orbFloat 12s ease-in-out infinite 2s',
          filter: 'blur(2px)',
        }} />
      </div>

      {/* ── Noise texture overlay ── */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.025]" style={{
        zIndex: 1,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: '200px 200px',
      }} />

      <div className="relative" style={{ zIndex: 2 }}>
        <Header />

        <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 flex flex-col gap-4 sm:gap-6">
          <div className="anim-0"><Hero /></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 xl:gap-6 items-start">
            <div className="lg:col-span-4 w-full sticky lg:top-[3.75rem] lg:z-10 anim-2">
              <AudioInputCard />
            </div>
            <div className="lg:col-span-8 w-full anim-3">
              <ResultWorkspace />
            </div>
          </div>
        </main>

        <footer className="w-full border-t border-white/[0.07] py-5">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <img src="/icon.svg" alt="Rangkum.in" className="w-4 h-4 opacity-50" />
              <span className="font-semibold text-white/70">Rangkum.in</span>
              <span className="text-white/30">— Voice to Minutes AI</span>
            </div>
            <p className="text-[11px] text-white/25">
              Memproses rekaman menjadi teks, terjemahan, notulen terstruktur, dan tanya-jawab AI.
            </p>
          </div>
        </footer>
      </div>

      <Toast />
      <ConfirmModal />
    </div>
  );
};

export default App;
