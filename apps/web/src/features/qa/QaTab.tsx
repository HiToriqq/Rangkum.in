import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Trash2, Sparkles, Loader2, Bot, User, Copy, Check } from 'lucide-react';
import { useSessionStore } from '../../store/useSessionStore';
import { askQuestion } from '../../lib/api';

function inlineFormat(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  if (parts.length === 1) return text;
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith('**') && p.endsWith('**')) return <strong key={i}>{p.slice(2, -2)}</strong>;
        if (p.startsWith('*') && p.endsWith('*')) return <em key={i}>{p.slice(1, -1)}</em>;
        return p;
      })}
    </>
  );
}

function renderMarkdown(text: string): React.ReactNode[] {
  return text.split('\n').map((line, i) => {
    if (line.startsWith('> ')) return <blockquote key={i} className="border-l-2 border-terracotta-500/60 pl-2 italic text-white/60 my-0.5">{inlineFormat(line.slice(2))}</blockquote>;
    if (/^[-*] /.test(line)) return <div key={i} className="flex gap-1.5 my-0.5"><span className="mt-1.5 w-1 h-1 rounded-full bg-terracotta-500 shrink-0" /><span>{inlineFormat(line.slice(2))}</span></div>;
    if (/^\d+\. /.test(line)) {
      const num = line.match(/^(\d+)\./)?.[1];
      return <div key={i} className="flex gap-1.5 my-0.5"><span className="shrink-0 text-terracotta-400 font-semibold">{num}.</span><span>{inlineFormat(line.replace(/^\d+\.\s*/, ''))}</span></div>;
    }
    if (line.trim() === '') return <div key={i} className="h-1" />;
    return <div key={i}>{inlineFormat(line)}</div>;
  });
}

export const QaTab: React.FC = () => {
  const { editedTranscript, qaMessages, addQaMessage, clearQaMessages, isAsking, setIsAsking, qaError, setQaError, showToast, showConfirmModal } = useSessionStore();
  const [question, setQuestion] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const requestIdRef = useRef(0);

  const quickQuestions = [
    'Apa saja keputusan utama yang disepakati?',
    'Siapa saja penanggung jawab tugas dan apa tenggat waktunya?',
    'Apakah ada poin perdebatan atau masalah yang belum terselesaikan?',
    'Buat rangkuman singkat dalam 3 butir penting.',
  ];

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [qaMessages, isAsking]);

  const handleSendQuestion = async (textToSend?: string) => {
    const q = (textToSend || question).trim();
    if (!q || isAsking) return;
    const transcript = editedTranscript;
    if (!transcript.trim()) { showToast('Transkrip belum tersedia.', 'warning'); return; }
    const requestId = ++requestIdRef.current;
    const history = qaMessages.map(({ role, content }) => ({ role, content }));
    addQaMessage({ role: 'user', content: q });
    setQuestion(''); setIsAsking(true); setQaError(null);
    try {
      const data = await askQuestion(q, transcript, history);
      if (requestId !== requestIdRef.current || useSessionStore.getState().editedTranscript !== transcript) return;
      if (data.isMock) throw new Error('Tanya AI tidak dapat digunakan dalam mode simulasi.');
      addQaMessage({ role: 'assistant', content: data.answer, references: data.references });
    } catch (err: unknown) {
      if (requestId !== requestIdRef.current) return;
      setQaError(err instanceof Error ? err.message : 'Gagal mengirim pertanyaan.');
      showToast('Gagal memproses pertanyaan.', 'error');
    } finally {
      if (requestId === requestIdRef.current) setIsAsking(false);
    }
  };

  const handleClearHistory = () => {
    showConfirmModal({
      title: 'Hapus Riwayat Percakapan?',
      message: 'Semua pertanyaan dan jawaban akan dibersihkan.',
      confirmLabel: 'Hapus Percakapan', cancelLabel: 'Batal', isDestructive: true,
      onConfirm: () => { requestIdRef.current += 1; clearQaMessages(); showToast('Riwayat percakapan dibersihkan.', 'info'); },
    });
  };

  const handleCopy = async (id: string, text: string) => {
    try { await navigator.clipboard.writeText(text); setCopiedId(id); showToast('Jawaban disalin.', 'success'); setTimeout(() => setCopiedId(null), 2000); }
    catch { showToast('Gagal menyalin.', 'error'); }
  };

  if (!editedTranscript.trim()) {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
          style={{ background: 'rgba(185,104,75,0.1)', border: '1px solid rgba(185,104,75,0.2)' }}>
          <MessageSquare className="w-6 h-6 text-terracotta-500/70" />
        </div>
        <h3 className="text-sm font-bold text-white/70">Belum Ada Transkrip untuk Tanya AI</h3>
        <p className="mt-1 text-xs text-white/35 max-w-sm">AI akan menjawab pertanyaan hanya berdasarkan fakta di dalam transkrip.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[min(65vh,520px)] min-h-[360px] sm:h-[520px] rounded-2xl overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>

      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)' }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(185,104,75,0.2)', border: '1px solid rgba(185,104,75,0.3)' }}>
            <Sparkles className="w-3.5 h-3.5 text-terracotta-400" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-white/80 leading-tight">Tanya AI Berdasarkan Rekaman</h3>
            <p className="text-[11px] text-white/30">Menjawab secara ketat hanya dari isi rekaman percakapan</p>
          </div>
        </div>
        {qaMessages.length > 0 && (
          <button type="button" onClick={handleClearHistory}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-white/35 hover:text-red-400 rounded-lg transition-colors"
            style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)' }}>
            <Trash2 className="w-3.5 h-3.5" /><span className="hidden sm:inline">Hapus Chat</span>
          </button>
        )}
      </div>

      {qaError && (
        <div role="alert" className="px-4 py-2 text-xs text-amber-300"
          style={{ borderBottom: '1px solid rgba(245,158,11,0.2)', background: 'rgba(245,158,11,0.08)' }}>
          {qaError}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
        {qaMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-6">
            <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2"
              style={{ background: 'rgba(185,104,75,0.1)', border: '1px solid rgba(185,104,75,0.2)' }}>
              <MessageSquare className="w-5 h-5 text-terracotta-500" />
            </div>
            <p className="text-xs sm:text-sm font-bold text-white/60">Mulai Percakapan dengan AI</p>
            <p className="mt-1 text-xs text-white/30 max-w-xs leading-relaxed">
              Ajukan pertanyaan seputar keputusan rapat, penanggung jawab tugas, atau topik yang dibahas.
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5 justify-center max-w-md">
              {quickQuestions.map((qText, idx) => (
                <button key={idx} type="button" onClick={() => handleSendQuestion(qText)} disabled={isAsking}
                  className="px-2.5 py-1.5 rounded-lg text-[11px] text-white/50 font-medium transition-all text-left disabled:opacity-40 hover:text-white/70"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  "{qText}"
                </button>
              ))}
            </div>
          </div>
        ) : (
          qaMessages.map((msg) => (
            <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: 'rgba(185,104,75,0.2)', border: '1px solid rgba(185,104,75,0.3)' }}>
                  <Bot className="w-4 h-4 text-terracotta-400" />
                </div>
              )}
              <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl p-3 text-xs sm:text-sm leading-relaxed"
                style={msg.role === 'user'
                  ? { background: 'rgba(185,104,75,0.35)', border: '1px solid rgba(185,104,75,0.3)', borderTopRightRadius: 4 }
                  : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderTopLeftRadius: 4 }
                }>
                <div className="flex items-center justify-between gap-2 mb-1 text-[10px] opacity-40">
                  <span className="font-semibold">{msg.role === 'user' ? 'Anda' : 'Asisten Rangkum.in'}</span>
                  <span>{msg.timestamp}</span>
                </div>
                <div className="space-y-0.5 text-xs sm:text-sm leading-relaxed text-white/85">
                  {msg.role === 'assistant' ? renderMarkdown(msg.content) : <span className="whitespace-pre-wrap">{msg.content}</span>}
                </div>
                {msg.references && msg.references.length > 0 && (
                  <div className="mt-2 pt-2 text-[11px] text-terracotta-400/70" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <span className="font-semibold">Referensi: </span>{msg.references.join(', ')}
                  </div>
                )}
                {msg.role === 'assistant' && (
                  <div className="mt-2 flex justify-end">
                    <button type="button" onClick={() => handleCopy(msg.id, msg.content)}
                      className="p-1 rounded text-white/25 hover:text-white/60 transition-colors">
                      {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: 'rgba(185,104,75,0.5)', border: '1px solid rgba(185,104,75,0.4)' }}>
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))
        )}
        {isAsking && (
          <div className="flex items-center gap-2 text-white/30 text-xs p-2">
            <Loader2 className="w-4 h-4 animate-spin text-terracotta-500" />
            <span>Menganalisis transkrip...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={(e) => { e.preventDefault(); handleSendQuestion(); }}
        className="p-3 flex items-center gap-2"
        style={{ borderTop: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
        <input type="text" value={question} onChange={(e) => setQuestion(e.target.value)}
          placeholder="Tanyakan hal spesifik seputar isi rekaman..."
          disabled={isAsking}
          className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm text-white/90 rounded-xl focus:outline-none placeholder-white/20 transition-all"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
        />
        <button type="submit" disabled={!question.trim() || isAsking}
          className="p-2.5 rounded-xl text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0 active:scale-95"
          style={{ background: 'rgba(185,104,75,0.7)', boxShadow: '0 0 14px rgba(185,104,75,0.3)' }}
          aria-label="Kirim Pertanyaan">
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
