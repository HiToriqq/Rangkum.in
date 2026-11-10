import React, { useState } from 'react';
import {
  FileCheck2,
  Sparkles,
  Copy,
  Check,
  Download,
  Plus,
  Trash2,
  Calendar,
  User,
  CheckSquare,
  AlertCircle,
  HelpCircle,
  Loader2,
  Edit3,
} from 'lucide-react';
import { useSessionStore } from '../../store/useSessionStore';
import type { MinutesActionItem } from '../../types';
import { exportMinutesPdf, generateMinutes } from '../../lib/api';
import { downloadBlobFile, downloadTextFile, formatMinutesAsText, sanitizeFileName } from '../../lib/format';

export const MinutesTab: React.FC = () => {
  const {
    editedTranscript,
    translations,
    minutesData,
    setMinutesData,
    updateMinutesData,
    minutesSource,
    setMinutesSource,
    minutesLang,
    setMinutesLang,
    isGeneratingMinutes,
    setIsGeneratingMinutes,
    minutesError,
    setMinutesError,
    showToast,
  } = useSessionStore();

  const [copied, setCopied] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const hasTranslation = Boolean(translations[minutesLang]);

  const handleGenerateMinutes = async () => {
    const textSource = minutesSource === 'translation' ? translations[minutesLang] : editedTranscript;

    if (!textSource) {
      setMinutesError(`Terjemahan ${minutesLang === 'id' ? 'Bahasa Indonesia' : 'English'} belum tersedia. Buat terjemahan tersebut terlebih dahulu.`);
      return;
    }

    if (!textSource.trim()) {
      showToast('Belum ada teks transkrip untuk membuat notulen.', 'warning');
      return;
    }

    setIsGeneratingMinutes(true);
    setMinutesError(null);

    try {
      const result = await generateMinutes(textSource, minutesLang);
      if (result.isMock) {
        throw new Error('Notulen tidak dapat dibuat dalam mode simulasi. Pastikan provider LLM sudah dikonfigurasi.');
      }

      const current = useSessionStore.getState();
      const currentSource = current.minutesSource === 'translation'
        ? current.translations[current.minutesLang]
        : current.editedTranscript;
      if (currentSource !== textSource || current.minutesLang !== minutesLang || current.minutesSource !== minutesSource) {
        showToast('Sumber transkrip berubah saat notulen dibuat. Silakan coba lagi.', 'info');
        return;
      }

      setMinutesData(result.minutes);
      showToast('Notulen rapat berhasil digenerate!', 'success');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal menghasilkan notulen.';
      setMinutesError(message);
      showToast('Gagal menghasilkan notulen.', 'error');
    } finally {
      setIsGeneratingMinutes(false);
    }
  };

  const handleCopyMinutes = async () => {
    if (!minutesData) return;

    try {
      await navigator.clipboard.writeText(formatMinutesAsText(minutesData, minutesLang));
      setCopied(true);
      showToast('Notulen berhasil disalin ke clipboard.', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Gagal menyalin notulen.', 'error');
    }
  };

  const handleExportPdf = async () => {
    if (!minutesData) return;
    setIsExportingPdf(true);

    try {
      const blob = await exportMinutesPdf(minutesData, minutesLang);
      const date = new Date().toISOString().slice(0, 10);
      const title = sanitizeFileName(minutesData.title).slice(0, 30) || 'rapat';
      downloadBlobFile(`notulen-${date}-${title}.pdf`, blob);
      showToast('Notulen PDF berhasil diunduh.', 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Gagal mengunduh PDF notulen.', 'error');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleExportTxt = () => {
    if (!minutesData) return;
    const date = new Date().toISOString().slice(0, 10);
    const title = sanitizeFileName(minutesData.title).slice(0, 30) || 'rapat';
    downloadTextFile(`notulen-${date}-${title}.txt`, formatMinutesAsText(minutesData, minutesLang));
    showToast('Notulen TXT berhasil diunduh.', 'success');
  };

  // Mutator helpers for editable minutes
  const updateTitle = (val: string) => {
    updateMinutesData((prev) => ({ ...prev, title: val }));
  };

  const updateSummary = (val: string) => {
    updateMinutesData((prev) => ({ ...prev, summary: val }));
  };

  const updateDiscussionPoint = (index: number, val: string) => {
    updateMinutesData((prev) => {
      const arr = [...prev.discussionPoints];
      arr[index] = val;
      return { ...prev, discussionPoints: arr };
    });
  };

  const removeDiscussionPoint = (index: number) => {
    updateMinutesData((prev) => ({
      ...prev,
      discussionPoints: prev.discussionPoints.filter((_, i) => i !== index),
    }));
  };

  const addDiscussionPoint = () => {
    updateMinutesData((prev) => ({
      ...prev,
      discussionPoints: [...prev.discussionPoints, 'Poin pembahasan baru'],
    }));
  };

  const updateDecision = (index: number, val: string) => {
    updateMinutesData((prev) => {
      const arr = [...prev.decisions];
      arr[index] = val;
      return { ...prev, decisions: arr };
    });
  };

  const removeDecision = (index: number) => {
    updateMinutesData((prev) => ({
      ...prev,
      decisions: prev.decisions.filter((_, i) => i !== index),
    }));
  };

  const addDecision = () => {
    updateMinutesData((prev) => ({
      ...prev,
      decisions: [...prev.decisions, 'Keputusan baru'],
    }));
  };

  const updateActionItem = (index: number, key: keyof MinutesActionItem, val: string) => {
    updateMinutesData((prev) => {
      const arr = [...prev.actionItems];
      arr[index] = { ...arr[index], [key]: val };
      return { ...prev, actionItems: arr };
    });
  };

  const removeActionItem = (index: number) => {
    updateMinutesData((prev) => ({
      ...prev,
      actionItems: prev.actionItems.filter((_, i) => i !== index),
    }));
  };

  const addActionItem = () => {
    updateMinutesData((prev) => ({
      ...prev,
      actionItems: [
        ...prev.actionItems,
        { task: 'Tugas tindak lanjut baru', owner: 'Tidak disebutkan', dueDate: 'Tidak disebutkan' },
      ],
    }));
  };

  if (!editedTranscript.trim()) {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center text-txt-muted">
        <div className="w-12 h-12 rounded-xl bg-bg-base border border-border flex items-center justify-center text-txt-muted mb-3">
          <FileCheck2 className="w-6 h-6 text-terracotta-600/70" />
        </div>
        <h3 className="text-sm sm:text-base font-bold text-navy-800">
          Belum Ada Transkrip untuk Membuat Notulen
        </h3>
        <p className="mt-1 text-xs text-txt-muted max-w-sm">
          Transkrip merupakan satu-satunya sumber fakta bagi notulen. Selesaikan transkripsi audio terlebih dahulu.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Options and Generation Controls */}
      <div className="p-3.5 bg-bg-surface rounded-xl border border-border shadow-card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Source selector */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-navy-800">Sumber:</span>
            <select
              value={minutesSource}
              onChange={(e) => setMinutesSource(e.target.value as 'original' | 'translation')}
              className="bg-bg-subtle text-navy-800 font-medium px-2 py-1 rounded-md border border-border focus:outline-none"
            >
              <option value="original">Transkrip Asli</option>
              <option value="translation" disabled={!hasTranslation}>
                Terjemahan {!hasTranslation ? '(Belum tersedia)' : ''}
              </option>
            </select>
          </div>

          {/* Target language */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-navy-800">Bahasa Notulen:</span>
            <select
              value={minutesLang}
              onChange={(e) => setMinutesLang(e.target.value as 'id' | 'en')}
              className="bg-bg-subtle text-navy-800 font-medium px-2 py-1 rounded-md border border-border focus:outline-none"
            >
              <option value="id">Bahasa Indonesia</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        {/* Generate / Action Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {minutesData && (
            <>
              <button
                type="button"
                onClick={handleCopyMinutes}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-navy-800 hover:bg-bg-subtle border border-border transition-colors"
                title="Salin notulen rapat"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin' : 'Salin'}</span>
              </button>

              <button
                type="button"
                onClick={handleExportTxt}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-navy-800 hover:bg-bg-subtle border border-border transition-colors"
                title="Unduh notulen sebagai TXT"
              >
                <Download className="w-3.5 h-3.5" />
                <span>TXT</span>
              </button>

              <button
                type="button"
                onClick={handleExportPdf}
                disabled={isExportingPdf}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-navy-800 hover:bg-bg-subtle border border-border transition-colors"
                title="Unduh notulen sebagai PDF"
              >
                {isExportingPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                <span>PDF</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={handleGenerateMinutes}
            disabled={isGeneratingMinutes}
            className="inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-terracotta-600 hover:bg-terracotta-700 transition-colors shadow-sm active:scale-95 disabled:opacity-60 whitespace-nowrap"
          >
            {isGeneratingMinutes ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Menyusun Notulen...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>{minutesData ? 'Susun Ulang' : 'Buat Notulen'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Minutes Content */}
      {minutesError && (
        <div role="alert" className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{minutesError}</p>
        </div>
      )}
      {minutesData ? (
        <div className="flex flex-col gap-4 bg-transparent sm:bg-bg-surface p-0 sm:p-6 rounded-none sm:rounded-2xl border-0 sm:border sm:border-border shadow-none sm:shadow-card">
          {/* Ambiguity / Needs Verification Alert */}
          {minutesData.needsVerification && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold">Memerlukan Verifikasi Pengguna:</span>
                <p className="mt-0.5">
                  Terdapat beberapa pernyataan atau tenggat dalam transkrip yang tidak dapat dipastikan dengan jelas. Silakan periksa kembali bagian yang ditandai.
                </p>
              </div>
            </div>
          )}

          {/* Editable Meeting Title */}
          <div>
            <label className="text-[11px] font-bold text-txt-muted uppercase tracking-wider block mb-1">
              Judul Pertemuan
            </label>
            <input
              type="text"
              value={minutesData.title}
              onChange={(e) => updateTitle(e.target.value)}
              className="w-full text-base sm:text-lg font-bold text-navy-800 bg-bg-base/40 px-3 py-2 rounded-xl border border-border focus:border-terracotta-500 focus:outline-none"
            />
          </div>

          {/* Editable Summary */}
          <div>
            <label className="text-[11px] font-bold text-txt-muted uppercase tracking-wider block mb-1">
              Ringkasan Eksekutif
            </label>
            <textarea
              value={minutesData.summary}
              onChange={(e) => updateSummary(e.target.value)}
              rows={3}
              className="w-full text-xs sm:text-sm text-navy-900 bg-bg-base/40 p-3 rounded-xl border border-border focus:border-terracotta-500 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Discussion Points */}
          <div>
            <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:justify-between mb-1.5">
              <label className="text-[11px] font-bold text-txt-muted uppercase tracking-wider">
                Poin Pembahasan ({minutesData.discussionPoints.length})
              </label>
              <button
                type="button"
                onClick={addDiscussionPoint}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-terracotta-600 hover:text-terracotta-700"
              >
                <Plus className="w-3 h-3" /> Tambah Poin
              </button>
            </div>
            <div className="space-y-2">
              {minutesData.discussionPoints.map((point, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-5 text-center text-xs font-mono font-bold text-txt-muted">{idx + 1}.</span>
                  <input
                    type="text"
                    value={point}
                    onChange={(e) => updateDiscussionPoint(idx, e.target.value)}
                    className="flex-1 text-xs sm:text-sm text-navy-900 bg-bg-base/30 px-3 py-1.5 rounded-lg border border-border focus:border-terracotta-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeDiscussionPoint(idx)}
                    className="p-1.5 text-txt-muted hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Decisions */}
          <div>
            <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:justify-between mb-1.5">
              <label className="text-[11px] font-bold text-txt-muted uppercase tracking-wider">
                Keputusan yang Disepakati ({minutesData.decisions.length})
              </label>
              <button
                type="button"
                onClick={addDecision}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-terracotta-600 hover:text-terracotta-700"
              >
                <Plus className="w-3 h-3" /> Tambah Keputusan
              </button>
            </div>
            <div className="space-y-2">
              {minutesData.decisions.map((dec, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                  <input
                    type="text"
                    value={dec}
                    onChange={(e) => updateDecision(idx, e.target.value)}
                    className="flex-1 text-xs sm:text-sm text-navy-900 bg-bg-base/30 px-3 py-1.5 rounded-lg border border-border focus:border-terracotta-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeDecision(idx)}
                    className="p-1.5 text-txt-muted hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Action Items */}
          <div>
            <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:justify-between mb-1.5">
              <label className="text-[11px] font-bold text-txt-muted uppercase tracking-wider">
                Action Items / Tindak Lanjut ({minutesData.actionItems.length})
              </label>
              <button
                type="button"
                onClick={addActionItem}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-terracotta-600 hover:text-terracotta-700"
              >
                <Plus className="w-3 h-3" /> Tambah Tugas
              </button>
            </div>
            <div className="space-y-2">
              {minutesData.actionItems.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 sm:p-3 bg-bg-base/40 rounded-xl border border-border flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3"
                >
                  <input
                    type="text"
                    value={item.task}
                    placeholder="Tugas"
                    onChange={(e) => updateActionItem(idx, 'task', e.target.value)}
                    className="w-full min-w-0 flex-1 text-xs sm:text-sm font-medium text-navy-900 bg-bg-surface px-2.5 py-1.5 rounded-lg border border-border focus:border-terracotta-500 focus:outline-none"
                  />
                  <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
                    <div className="flex min-w-[100px] flex-1 items-center gap-1 bg-bg-surface px-2 py-1 rounded-lg border border-border text-xs text-txt-muted">
                      <User className="w-3.5 h-3.5 text-navy-600" />
                      <input
                        type="text"
                        value={item.owner}
                        placeholder="PIC"
                        onChange={(e) => updateActionItem(idx, 'owner', e.target.value)}
                        className="w-full min-w-0 bg-transparent text-navy-800 font-semibold focus:outline-none sm:w-24"
                      />
                    </div>
                    <div className="flex min-w-[100px] flex-1 items-center gap-1 bg-bg-surface px-2 py-1 rounded-lg border border-border text-xs text-txt-muted">
                      <Calendar className="w-3.5 h-3.5 text-terracotta-600" />
                      <input
                        type="text"
                        value={item.dueDate}
                        placeholder="Tenggat"
                        onChange={(e) => updateActionItem(idx, 'dueDate', e.target.value)}
                        className="w-full min-w-0 bg-transparent text-navy-800 font-semibold focus:outline-none sm:w-24"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeActionItem(idx)}
                      className="p-1 text-txt-muted hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center border-2 border-dashed border-border rounded-xl bg-bg-base/30">
          <FileCheck2 className="w-8 h-8 text-terracotta-600 mb-2" />
          <h4 className="text-sm font-bold text-navy-800">
            Siap Menghasilkan Notulen Otomatis
          </h4>
          <p className="mt-1 text-xs text-txt-muted max-w-sm">
            Klik tombol <strong>"Buat Notulen"</strong> untuk mengekstrak ringkasan, keputusan yang disepakati, serta action items secara terstruktur dari transkrip.
          </p>
        </div>
      )}
    </div>
  );
};
