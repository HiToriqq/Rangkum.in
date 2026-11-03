import React, { useState } from 'react';
import { Copy, Check, Download, RotateCcw, Clock, User, Sparkles, FileText } from 'lucide-react';
import { useSessionStore } from '../../store/useSessionStore';
import { downloadTextFile, formatDuration } from '../../lib/format';

export const TranscriptTab: React.FC = () => {
  const {
    rawTranscript,
    editedTranscript,
    setEditedTranscript,
    restoreRawTranscript,
    segments,
    detectedLanguage,
    language,
    isMock,
    showToast,
    showConfirmModal,
  } = useSessionStore();

  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'text' | 'segments'>('text');

  const isEdited = rawTranscript.trim() !== editedTranscript.trim();
  const wordCount = editedTranscript.trim() ? editedTranscript.trim().split(/\s+/).length : 0;
  const charCount = editedTranscript.length;

  const handleCopy = async () => {
    if (!editedTranscript) return;
    try {
      await navigator.clipboard.writeText(editedTranscript);
      setCopied(true);
      showToast('Transkrip disalin ke clipboard.', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Gagal menyalin transkrip.', 'error');
    }
  };

  const handleDownloadTxt = () => {
    if (!editedTranscript) return;
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadTextFile(`transkrip-${dateStr}.txt`, editedTranscript);
    showToast('File transkrip (.txt) diunduh.', 'success');
  };

  const handleRestore = () => {
    showConfirmModal({
      title: 'Pulihkan Transkrip Asli?',
      message: 'Semua perubahan manual yang Anda ketik akan dibatalkan dan teks dikembalikan ke hasil transkrip awal.',
      confirmLabel: 'Pulihkan Teks Asli',
      cancelLabel: 'Batal',
      onConfirm: () => {
        restoreRawTranscript();
        showToast('Transkrip asli dipulihkan.', 'info');
      },
    });
  };

  if (!editedTranscript && !rawTranscript) {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center text-txt-muted">
        <div className="w-12 h-12 rounded-xl bg-bg-base border border-border flex items-center justify-center text-txt-muted mb-3">
          <FileText className="w-6 h-6 text-terracotta-600/70" />
        </div>
        <h3 className="text-sm sm:text-base font-bold text-navy-800">
          Belum Ada Transkrip
        </h3>
        <p className="mt-1 text-xs text-txt-muted max-w-sm">
          Pilih atau rekam audio di sebelah kiri, kemudian klik tombol <strong>"Transkripsikan Audio"</strong> untuk memulai.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Top action toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border">
        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="px-2.5 py-1 rounded-md bg-navy-50 text-navy-800 font-semibold border border-navy-100">
            Bahasa: {detectedLanguage ? detectedLanguage.toUpperCase() : language.toUpperCase()}
          </span>

          {isMock && (
            <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[11px] font-semibold border border-amber-200">
              Mock Provider Mode
            </span>
          )}

          {isEdited && (
            <span className="px-2 py-0.5 rounded-md bg-terracotta-50 text-terracotta-700 text-[11px] font-semibold border border-terracotta-200">
              Telah Diedit
            </span>
          )}

          <span className="text-txt-muted text-[11px] font-mono">
            {wordCount} kata • {charCount} karakter
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5">
          {segments && segments.length > 0 && (
            <div className="flex rounded-lg bg-bg-subtle p-0.5 border border-border text-xs mr-1">
              <button
                type="button"
                onClick={() => setViewMode('text')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  viewMode === 'text' ? 'bg-bg-surface text-navy-800 shadow-sm' : 'text-txt-muted'
                }`}
              >
                Teks Lengkap
              </button>
              <button
                type="button"
                onClick={() => setViewMode('segments')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  viewMode === 'segments' ? 'bg-bg-surface text-navy-800 shadow-sm' : 'text-txt-muted'
                }`}
              >
                Segmen Waktu
              </button>
            </div>
          )}

          {isEdited && (
            <button
              type="button"
              onClick={handleRestore}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-txt-muted hover:text-navy-800 hover:bg-bg-subtle border border-border transition-colors"
              title="Kembalikan teks ke versi awal"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pulihkan Asli</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-navy-800 hover:bg-bg-subtle border border-border transition-colors"
            title="Salin transkrip"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Tersalin' : 'Salin'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadTxt}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-navy-800 hover:bg-navy-700 transition-colors shadow-sm"
            title="Unduh file .txt"
          >
            <Download className="w-3.5 h-3.5" />
            <span>TXT</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'text' ? (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="transcript-editor" className="text-[11px] font-medium text-txt-muted flex items-center justify-between">
            <span>Editor Transkrip (dapat dikoreksi langsung):</span>
            <span className="text-[11px] text-terracotta-600">Perubahan disimpan otomatis di sesi</span>
          </label>
          <textarea
            id="transcript-editor"
            value={editedTranscript}
            onChange={(e) => setEditedTranscript(e.target.value)}
            rows={14}
            className="w-full p-3.5 bg-bg-surface text-xs sm:text-sm text-navy-900 font-normal leading-relaxed rounded-xl border border-border focus:border-terracotta-500 focus:outline-none resize-y transition-colors font-sans shadow-inner"
            placeholder="Ketik atau koreksi transkrip di sini..."
          />
        </div>
      ) : (
        /* Segments with timestamps */
        <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
          {segments.map((seg, idx) => (
            <div
              key={seg.id || idx}
              className="p-3 bg-bg-surface rounded-xl border border-border shadow-sm flex flex-col gap-1 hover:border-navy-300 transition-colors"
            >
              <div className="flex items-center justify-between text-[11px] text-txt-muted">
                <span className="inline-flex items-center gap-1 font-mono font-medium text-terracotta-700 bg-terracotta-50 px-1.5 py-0.5 rounded border border-terracotta-100">
                  <Clock className="w-3 h-3" />
                  {formatDuration(seg.start)} - {formatDuration(seg.end)}
                </span>
                {seg.speaker && (
                  <span className="inline-flex items-center gap-1 font-semibold text-navy-800 bg-navy-50 px-1.5 py-0.5 rounded border border-navy-100">
                    <User className="w-3 h-3 text-navy-600" />
                    {seg.speaker}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-navy-900 leading-relaxed mt-0.5">
                {seg.text}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
