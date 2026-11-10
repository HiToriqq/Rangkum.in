import React, { useState } from 'react';
import { FileCheck2, Sparkles, Copy, Check, Download, Plus, Trash2, Calendar, User, CheckSquare, AlertCircle, Loader2 } from 'lucide-react';
import { useSessionStore } from '../../store/useSessionStore';
import type { MinutesActionItem } from '../../types';
import { exportMinutesPdf, generateMinutes } from '../../lib/api';
import { downloadBlobFile, downloadTextFile, formatMinutesAsText, sanitizeFileName } from '../../lib/format';

const inputCls = "w-full bg-transparent text-white/80 focus:outline-none placeholder-white/20";
const fieldBox = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' };

export const MinutesTab: React.FC = () => {
  const {
    editedTranscript, translations, minutesData, setMinutesData, updateMinutesData,
    minutesSource, setMinutesSource, minutesLang, setMinutesLang,
    isGeneratingMinutes, setIsGeneratingMinutes, minutesError, setMinutesError, showToast,
  } = useSessionStore();

  const [copied, setCopied] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const hasTranslation = Boolean(translations[minutesLang]);

  const handleGenerate = async () => {
    const textSource = minutesSource === 'translation' ? translations[minutesLang] : editedTranscript;
    if (!textSource?.trim()) { showToast('Belum ada teks untuk membuat notulen.', 'warning'); return; }
    setIsGeneratingMinutes(true); setMinutesError(null);
    try {
      const result = await generateMinutes(textSource, minutesLang);
      if (result.isMock) throw new Error('Notulen tidak dapat dibuat dalam mode simulasi.');
      setMinutesData(result.minutes);
      showToast('Notulen rapat berhasil digenerate!', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menghasilkan notulen.';
      setMinutesError(msg); showToast('Gagal menghasilkan notulen.', 'error');
    } finally { setIsGeneratingMinutes(false); }
  };

  const handleCopy = async () => {
    if (!minutesData) return;
    try { await navigator.clipboard.writeText(formatMinutesAsText(minutesData, minutesLang)); setCopied(true); showToast('Notulen disalin.', 'success'); setTimeout(() => setCopied(false), 2000); }
    catch { showToast('Gagal menyalin.', 'error'); }
  };

  const handleExportPdf = async () => {
    if (!minutesData) return;
    setIsExportingPdf(true);
    try {
      const blob = await exportMinutesPdf(minutesData, minutesLang);
      const title = sanitizeFileName(minutesData.title).slice(0, 30) || 'rapat';
      downloadBlobFile(`notulen-${new Date().toISOString().slice(0, 10)}-${title}.pdf`, blob);
      showToast('PDF berhasil diunduh.', 'success');
    } catch (e) { showToast(e instanceof Error ? e.message : 'Gagal mengunduh PDF.', 'error'); }
    finally { setIsExportingPdf(false); }
  };

  const handleExportTxt = () => {
    if (!minutesData) return;
    const title = sanitizeFileName(minutesData.title).slice(0, 30) || 'rapat';
    downloadTextFile(`notulen-${new Date().toISOString().slice(0, 10)}-${title}.txt`, formatMinutesAsText(minutesData, minutesLang));
    showToast('TXT berhasil diunduh.', 'success');
  };

  const upd = (fn: (prev: typeof minutesData) => typeof minutesData) => updateMinutesData(fn as any);
  const updArr = <T,>(key: string, idx: number, val: T) => upd((p: any) => { const a = [...p[key]]; a[idx] = val; return { ...p, [key]: a }; });
  const remArr = (key: string, idx: number) => upd((p: any) => ({ ...p, [key]: (p[key] as any[]).filter((_: any, i: number) => i !== idx) }));

  const selectCls = "bg-transparent text-white/70 font-medium px-2 py-1 rounded-lg focus:outline-none cursor-pointer";
  const selectStyle = { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' };

  if (!editedTranscript.trim()) {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
          style={{ background: 'rgba(185,104,75,0.1)', border: '1px solid rgba(185,104,75,0.2)' }}>
          <FileCheck2 className="w-6 h-6 text-terracotta-400" />
        </div>
        <h3 className="text-sm font-bold text-white/70">Belum Ada Transkrip untuk Membuat Notulen</h3>
        <p className="mt-1.5 text-xs text-white/40 max-w-sm">Transkrip adalah satu-satunya sumber fakta. Selesaikan transkripsi terlebih dahulu.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-white/50">Sumber:</span>
            <select value={minutesSource} onChange={(e) => setMinutesSource(e.target.value as any)} className={selectCls} style={selectStyle}>
              <option value="original" className="bg-bg-card">Transkrip Asli</option>
              <option value="translation" disabled={!hasTranslation} className="bg-bg-card">Terjemahan {!hasTranslation ? '(Belum tersedia)' : ''}</option>
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-white/50">Bahasa Notulen:</span>
            <select value={minutesLang} onChange={(e) => setMinutesLang(e.target.value as any)} className={selectCls} style={selectStyle}>
              <option value="id" className="bg-bg-card">Bahasa Indonesia</option>
              <option value="en" className="bg-bg-card">English</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {minutesData && (
            <>
              <button type="button" onClick={handleCopy}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white/60 hover:text-white/90 transition-all"
                style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)' }}>
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin' : 'Salin'}</span>
              </button>
              <button type="button" onClick={handleExportTxt}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white/60 hover:text-white/90 transition-all"
                style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)' }}>
                <Download className="w-3.5 h-3.5" /><span>TXT</span>
              </button>
              <button type="button" onClick={handleExportPdf} disabled={isExportingPdf}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white/60 hover:text-white/90 transition-all disabled:opacity-50"
                style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)' }}>
                {isExportingPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                <span>PDF</span>
              </button>
            </>
          )}
          <button type="button" onClick={handleGenerate} disabled={isGeneratingMinutes}
            className="btn-primary inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-60 whitespace-nowrap">
            {isGeneratingMinutes
              ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /><span>Menyusun...</span></>
              : <><Sparkles className="w-3.5 h-3.5" /><span>{minutesData ? 'Susun Ulang' : 'Buat Notulen'}</span></>
            }
          </button>
        </div>
      </div>

      {minutesError && (
        <div role="alert" className="flex items-start gap-2 rounded-xl p-3 text-xs text-amber-300"
          style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" /><p>{minutesError}</p>
        </div>
      )}

      {minutesData ? (
        <div className="flex flex-col gap-5">
          {minutesData.needsVerification && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl text-xs text-amber-300"
              style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
              <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              <div><span className="font-bold">Memerlukan Verifikasi:</span><p className="mt-0.5 text-amber-400/80">Terdapat pernyataan yang tidak dapat dipastikan. Periksa kembali bagian yang ditandai.</p></div>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="text-[10px] font-bold text-white/30 uppercase tracking-wider block mb-1.5">Judul Pertemuan</label>
            <input type="text" value={minutesData.title} onChange={(e) => upd((p: any) => ({ ...p, title: e.target.value }))}
              className="w-full text-base sm:text-lg font-bold text-white/85 px-3 py-2 rounded-xl focus:outline-none" style={fieldBox} />
          </div>

          {/* Summary */}
          <div>
            <label className="text-[10px] font-bold text-white/30 uppercase tracking-wider block mb-1.5">Ringkasan Eksekutif</label>
            <textarea value={minutesData.summary} onChange={(e) => upd((p: any) => ({ ...p, summary: e.target.value }))}
              rows={3} className="w-full text-xs sm:text-sm text-white/75 p-3 rounded-xl focus:outline-none leading-relaxed resize-y" style={fieldBox} />
          </div>

          {/* Discussion Points */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-bold text-white/30 uppercase tracking-wider">Poin Pembahasan ({minutesData.discussionPoints.length})</label>
              <button type="button" onClick={() => upd((p: any) => ({ ...p, discussionPoints: [...p.discussionPoints, 'Poin baru'] }))}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-terracotta-400 hover:text-terracotta-300">
                <Plus className="w-3 h-3" />Tambah Poin
              </button>
            </div>
            <div className="space-y-2">
              {minutesData.discussionPoints.map((pt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-5 text-center text-xs font-mono font-bold text-white/25">{i + 1}.</span>
                  <input type="text" value={pt} onChange={(e) => updArr('discussionPoints', i, e.target.value)}
                    className="flex-1 text-xs sm:text-sm text-white/75 px-3 py-1.5 rounded-lg focus:outline-none" style={fieldBox} />
                  <button type="button" onClick={() => remArr('discussionPoints', i)} className="p-1.5 text-white/25 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>
          </div>

          {/* Decisions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-bold text-white/30 uppercase tracking-wider">Keputusan yang Disepakati ({minutesData.decisions.length})</label>
              <button type="button" onClick={() => upd((p: any) => ({ ...p, decisions: [...p.decisions, 'Keputusan baru'] }))}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-terracotta-400 hover:text-terracotta-300">
                <Plus className="w-3 h-3" />Tambah Keputusan
              </button>
            </div>
            <div className="space-y-2">
              {minutesData.decisions.map((dec, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-emerald-500/70 shrink-0" />
                  <input type="text" value={dec} onChange={(e) => updArr('decisions', i, e.target.value)}
                    className="flex-1 text-xs sm:text-sm text-white/75 px-3 py-1.5 rounded-lg focus:outline-none" style={fieldBox} />
                  <button type="button" onClick={() => remArr('decisions', i)} className="p-1.5 text-white/25 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>
          </div>

          {/* Action Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-bold text-white/30 uppercase tracking-wider">Action Items ({minutesData.actionItems.length})</label>
              <button type="button" onClick={() => upd((p: any) => ({ ...p, actionItems: [...p.actionItems, { task: 'Tugas baru', owner: 'Tidak disebutkan', dueDate: 'Tidak disebutkan' }] }))}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-terracotta-400 hover:text-terracotta-300">
                <Plus className="w-3 h-3" />Tambah Tugas
              </button>
            </div>
            <div className="space-y-2">
              {minutesData.actionItems.map((item, i) => (
                <div key={i} className="p-2.5 sm:p-3 rounded-xl flex flex-col sm:flex-row sm:items-center gap-2" style={fieldBox}>
                  <input type="text" value={item.task} placeholder="Tugas"
                    onChange={(e) => updArr('actionItems', i, { ...item, task: e.target.value })}
                    className="flex-1 min-w-0 text-xs sm:text-sm font-medium text-white/80 px-2.5 py-1.5 rounded-lg focus:outline-none"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }} />
                  <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
                    <div className="flex min-w-[100px] flex-1 items-center gap-1 px-2 py-1 rounded-lg text-xs"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <User className="w-3.5 h-3.5 text-white/30" />
                      <input type="text" value={item.owner} placeholder="PIC"
                        onChange={(e) => updArr('actionItems', i, { ...item, owner: e.target.value })}
                        className="w-full min-w-0 bg-transparent text-white/70 font-semibold focus:outline-none sm:w-24" />
                    </div>
                    <div className="flex min-w-[100px] flex-1 items-center gap-1 px-2 py-1 rounded-lg text-xs"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <Calendar className="w-3.5 h-3.5 text-terracotta-500/60" />
                      <input type="text" value={item.dueDate} placeholder="Tenggat"
                        onChange={(e) => updArr('actionItems', i, { ...item, dueDate: e.target.value })}
                        className="w-full min-w-0 bg-transparent text-white/70 font-semibold focus:outline-none sm:w-24" />
                    </div>
                    <button type="button" onClick={() => remArr('actionItems', i)} className="p-1 text-white/25 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-xl"
          style={{ border: '2px dashed rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
          <FileCheck2 className="w-8 h-8 text-terracotta-500 mb-2" />
          <h4 className="text-sm font-bold text-white/60">Siap Menghasilkan Notulen Otomatis</h4>
          <p className="mt-1 text-xs text-white/35 max-w-sm">
            Klik <strong className="text-white/50">"Buat Notulen"</strong> untuk mengekstrak ringkasan, keputusan, dan action items dari transkrip.
          </p>
        </div>
      )}
    </div>
  );
};
