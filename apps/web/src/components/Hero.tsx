import React from 'react';
import { ShieldAlert } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section className="w-full pt-5 pb-1 sm:pt-8 sm:pb-2">
      <div className="max-w-3xl mx-auto">
        <p className="text-[11px] sm:text-xs font-semibold tracking-[0.12em] uppercase text-terracotta-700">
          Ruang kerja audio
        </p>
        <h1 className="mt-2 text-[26px] sm:text-3xl md:text-4xl font-bold text-navy-800 tracking-tight leading-[1.15]">
          Ubah Percakapan Menjadi Pemahaman.
        </h1>
        <p className="mt-2 text-sm sm:text-base text-txt-muted max-w-2xl leading-relaxed">
          Rekam, unggah, atau tautkan audio untuk membuat transkrip, terjemahan, dan notulen.
        </p>
        <p className="mt-3 flex items-start gap-1.5 text-[11px] sm:text-xs text-txt-muted">
          <ShieldAlert className="w-3.5 h-3.5 mt-0.5 text-terracotta-600 shrink-0" />
          <span>Pemrosesan memerlukan backend aktif. Hasil AI tidak dibuat sebagai simulasi.</span>
        </p>
      </div>
    </section>
  );
};
