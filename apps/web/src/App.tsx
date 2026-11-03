import React from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { AudioInputCard } from './features/audio-input/AudioInputCard';
import { ResultWorkspace } from './features/workspace/ResultWorkspace';
import { Toast } from './components/Toast';
import { ConfirmModal } from './components/ConfirmModal';

export const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg-base flex flex-col selection:bg-terracotta-100 selection:text-terracotta-900">
      {/* Global Header */}
      <Header />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-12 flex flex-col gap-6 sm:gap-8">
        {/* Compact Hero */}
        <Hero />

        {/* 2-Column Responsive Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Audio Input Card (5 cols on lg) */}
          <div className="lg:col-span-5 w-full sticky lg:top-20 z-10">
            <AudioInputCard />
          </div>

          {/* Right Column: Result Workspace (7 cols on lg) */}
          <div className="lg:col-span-7 w-full">
            <ResultWorkspace />
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="w-full border-t border-border bg-bg-surface/50 py-6 text-center text-xs text-txt-muted">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <img src="/icon.svg" alt="Rangkum.in" className="w-4 h-4 opacity-75" />
            <span className="font-semibold text-navy-800">Rangkum.in</span>
            <span>— Voice to Minutes AI</span>
          </div>
          <p className="text-[11px]">
            Memproses rekaman menjadi teks, terjemahan, notulen terstruktur, dan tanya-jawab AI.
          </p>
        </div>
      </footer>

      {/* Global Modals & Notifications */}
      <Toast />
      <ConfirmModal />
    </div>
  );
};

export default App;
