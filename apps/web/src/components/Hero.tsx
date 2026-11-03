import React from 'react';
import { Mic, FileText, Globe2, MessageSquare, ShieldAlert } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <div className="w-full pt-6 pb-4 sm:pt-8 sm:pb-6 text-center">
      <div className="max-w-3xl mx-auto px-4">
        {/* Subtle pill badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-terracotta-50 border border-terracotta-200 text-terracotta-700 text-xs font-medium mb-3 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-terracotta-600 animate-ping" />
          <span>Sistem Notulen & Transkripsi Cerdas</span>
        </div>

        {/* Main Title */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-navy-800 tracking-tight leading-tight">
          Ubah Percakapan Menjadi Pemahaman.
        </h1>

        {/* Description */}
        <p className="mt-2.5 text-sm sm:text-base text-txt-muted max-w-2xl mx-auto leading-relaxed">
          Rekam suara diskusi, unggah file rekaman, atau gunakan link audio langsung untuk
          menghasilkan transkrip akurat, terjemahan bilingual, notulen terstruktur, dan tanya-jawab AI berbasis rekaman.
        </p>

        {/* Step Indicators */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-left">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-surface border border-border/80 shadow-card">
            <div className="p-1.5 rounded-md bg-navy-50 text-navy-700">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-navy-800 leading-tight">1. Input Audio</p>
              <p className="text-[11px] text-txt-muted">Suara / File / Link</p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-surface border border-border/80 shadow-card">
            <div className="p-1.5 rounded-md bg-navy-50 text-navy-700">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-navy-800 leading-tight">2. Transkrip</p>
              <p className="text-[11px] text-txt-muted">Teks dapat diedit</p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-surface border border-border/80 shadow-card">
            <div className="p-1.5 rounded-md bg-terracotta-50 text-terracotta-700">
              <Globe2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-navy-800 leading-tight">3. Notulen & EN/ID</p>
              <p className="text-[11px] text-txt-muted">Action items & ringkasan</p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-surface border border-border/80 shadow-card">
            <div className="p-1.5 rounded-md bg-navy-50 text-navy-700">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-navy-800 leading-tight">4. Tanya AI</p>
              <p className="text-[11px] text-txt-muted">Kontekstual rekaman</p>
            </div>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-txt-muted/80">
          <ShieldAlert className="w-3.5 h-3.5 text-terracotta-500 flex-shrink-0" />
          <span>Privasi terjaga: Audio diproses untuk transkripsi dan tidak disimpan permanen di server.</span>
        </div>
      </div>
    </div>
  );
};
