import React from 'react';
import { Sparkles, Mic, FileText, MessageSquare } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section className="w-full pt-8 pb-3 sm:pt-12 sm:pb-4">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-5"
        style={{
          background: 'rgba(185,104,75,0.15)',
          border: '1px solid rgba(185,104,75,0.4)',
          boxShadow: '0 0 20px rgba(185,104,75,0.2)',
        }}>
        <Sparkles className="w-3.5 h-3.5 text-terracotta-400" style={{ animation: 'glowPulse 2s ease-in-out infinite' }} />
        <span className="text-[11px] font-bold tracking-[0.14em] uppercase text-terracotta-300">
          Ruang kerja audio
        </span>
      </div>

      {/* Headline */}
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.1] mb-4">
        <span className="text-white">Ubah Percakapan </span>
        <br className="hidden sm:block" />
        <span className="text-gradient-warm">Menjadi Pemahaman.</span>
      </h1>

      <p className="text-sm sm:text-base text-white/50 max-w-lg leading-relaxed mb-6">
        Rekam, unggah, atau tautkan audio untuk membuat transkrip, terjemahan, dan notulen otomatis.
      </p>

      {/* Feature pills */}
      <div className="flex flex-wrap gap-2">
        {[
          { icon: <Mic className="w-3 h-3" />, label: 'Rekam Langsung' },
          { icon: <FileText className="w-3 h-3" />, label: 'Transkrip & Terjemahan' },
          { icon: <MessageSquare className="w-3 h-3" />, label: 'Tanya AI' },
        ].map(({ icon, label }) => (
          <div key={label} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium text-white/50"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <span className="text-terracotta-500">{icon}</span>
            {label}
          </div>
        ))}
      </div>
    </section>
  );
};
