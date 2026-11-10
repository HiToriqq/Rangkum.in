import React, { useState } from 'react';
import { Copy, Check, Download, RotateCcw, Clock, User, FileText } from 'lucide-react';
import { useSessionStore } from '../../store/useSessionStore';
import { downloadTextFile, formatDuration } from '../../lib/format';

export const TranscriptTab: React.FC = () => {
  const {
    rawTranscript, editedTranscript, setEditedTranscript, restoreRawTranscript,
    segments, detectedLanguage, language, isMock, showToast, showConfirmModal,
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
    } catch { showToast('Gagal menyalin transkrip.', 'error'); }
  };

  const handleDownloadTxt = () => {
    if (!editedTranscript) return;
    downloadTextFile(`transkrip-${new Date().toISOString().slice(0, 10)}.txt`, editedTranscript);
    showToast('File transkrip (.txt) diunduh.', 'success');
  };

  const handleRestore = () => {
    showConfirmModal({
      title: 'Pulihkan Transkrip Asli?',
      message: 'Semua perubahan manual akan dibatalkan dan teks dikembalikan ke hasil transkrip awal.',
      confirmLabel: 'Pulihkan Teks Asli', cancelLabel: 'Batal',
      onConfirm: () => { restoreRawTranscript(); showToast('Transkrip asli dipulihkan.', 'info'); },
    });
  };

  if (!editedTranscript && !rawTranscript) {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
          style={{ background: 'rgba(185,104,75,0.1)', border: '1px solid rgba(185,104,75,0.2)' }}>
          <FileText className="w-6 h-6 text-terracotta-400" />
        </div>
        <h3 className="text-sm sm:text-base font-bold text-white/70">Belum Ada Transkrip</h3>
        <p className="mt-1.5 text-xs text-white/40 max-w-sm leading-relaxed">
          Pilih atau rekam audio di sebelah kiri, kemudian klik tombol{' '}
          <strong className="text-white/60">"Transkripsikan Audio"</strong> untuk memulai.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="px-2.5 py-1 rounded-md font-semibold text-white/70"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
            Bahasa: {(detectedLanguage || language).toUpperCase()}
          </span>
          {isMock && (
            <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold text-amber-300"
              style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
              Mock Provider Mode
            </span>
          )}
          {isEdited && (
            <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold text-terracotta-300"
              style={{ background: 'rgba(185,104,75,0.1)', border: '1px solid rgba(185,104,75,0.2)' }}>
              Telah Diedit
            </span>
          )}
          <span className="text-white/30 text-[11px] font-mono">{wordCount} kata · {charCount} karakter</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          {segments && segments.length > 0 && (
            <div className="flex rounded-lg p-0.5 mr-1 text-xs"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              {(['text', 'segments'] as const).map((mode) => (
                <button key={mode} type="button" onClick={() => setViewMode(mode)}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    viewMode === mode ? 'text-white/90' : 'text-white/35 hover:text-white/60'
                  }`}
                  style={viewMode === mode ? { background: 'rgba(255,255,255,0.09)' } : {}}>
                  {mode === 'text' ? 'Teks Lengkap' : 'Segmen Waktu'}
                </button>
              ))}
            </div>
          )}

          {isEdited && (
            <button type="button" onClick={handleRestore}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-white/40 hover:text-white/70 transition-colors"
              style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)' }}>
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pulihkan Asli</span>
            </button>
          )}

          <button type="button" onClick={handleCopy}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white/70 hover:text-white/90 transition-colors"
            style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.05)' }}>
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Tersalin' : 'Salin'}</span>
          </button>

          <button type="button" onClick={handleDownloadTxt}
            className="btn-primary inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white">
            <Download className="w-3.5 h-3.5" />
            <span>TXT</span>
          </button>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'text' ? (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="transcript-editor" className="text-[11px] font-medium text-white/35 flex items-center justify-between">
            <span>Editor Transkrip (dapat dikoreksi langsung):</span>
            <span className="text-terracotta-500/70">Perubahan disimpan otomatis di sesi</span>
          </label>
          <textarea
            id="transcript-editor"
            value={editedTranscript}
            onChange={(e) => setEditedTranscript(e.target.value)}
            rows={14}
            className="w-full p-3.5 text-xs sm:text-sm text-white/80 font-normal leading-relaxed rounded-xl focus:outline-none resize-y transition-all font-sans"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              caretColor: '#B9684B',
            }}
            placeholder="Ketik atau koreksi transkrip di sini..."
          />
        </div>
      ) : (
        <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
          {segments.map((seg, idx) => (
            <div key={seg.id || idx} className="p-3 rounded-xl flex flex-col gap-1 transition-all"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center justify-between text-[11px]">
                <span className="inline-flex items-center gap-1 font-mono font-medium text-terracotta-400 px-1.5 py-0.5 rounded"
                  style={{ background: 'rgba(185,104,75,0.1)', border: '1px solid rgba(185,104,75,0.2)' }}>
                  <Clock className="w-3 h-3" />
                  {formatDuration(seg.start)} - {formatDuration(seg.end)}
                </span>
                {seg.speaker && (
                  <span className="inline-flex items-center gap-1 font-semibold text-white/60 px-1.5 py-0.5 rounded"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <User className="w-3 h-3" />{seg.speaker}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-white/75 leading-relaxed mt-0.5">{seg.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
