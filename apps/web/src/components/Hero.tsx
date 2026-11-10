import React from 'react';

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
      </div>
    </section>
  );
};
