import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Trash2,
  Sparkles,
  Loader2,
  Clock,
  RotateCcw,
  Bot,
  User,
  Copy,
  Check,
} from 'lucide-react';
import { useSessionStore } from '../../store/useSessionStore';

export const QaTab: React.FC = () => {
  const {
    editedTranscript,
    qaMessages,
    addQaMessage,
    clearQaMessages,
    isAsking,
    setIsAsking,
    setQaError,
    showToast,
    showConfirmModal,
  } = useSessionStore();

  const [question, setQuestion] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const quickQuestions = [
    'Apa saja keputusan utama yang disepakati?',
    'Siapa saja penanggung jawab tugas dan apa tenggat waktunya?',
    'Apakah ada poin perdebatan atau masalah yang belum terselesaikan?',
    'Buat rangkuman singkat dalam 3 butir penting.',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [qaMessages, isAsking]);

  const handleSendQuestion = async (textToSend?: string) => {
    const q = (textToSend || question).trim();
    if (!q) return;

    if (!editedTranscript.trim()) {
      showToast('Transkrip belum tersedia. Selesaikan transkripsi terlebih dahulu.', 'warning');
      return;
    }

    // Add user message
    addQaMessage({
      role: 'user',
      content: q,
    });
    setQuestion('');
    setIsAsking(true);
    setQaError(null);

    try {
      const response = await fetch('/api/qa/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          transcript: editedTranscript,
          history: qaMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      }).catch(() => null);

      if (!response || !response.ok) {
        addQaMessage({
          role: 'assistant',
          content:
            'Layanan tanya-jawab AI backend belum terhubung (POST /api/qa/ask). Pada tahap backend berikutnya, asisten AI akan menjawab pertanyaan secara ketat berdasarkan isi rekaman dan transkrip.',
        });
        showToast('Backend QA belum terhubung.', 'info');
      } else {
        const data = await response.json();
        addQaMessage({
          role: 'assistant',
          content: data.answer,
          references: data.references,
        });
      }
    } catch (err: unknown) {
      const error = err as Error;
      setQaError(error.message || 'Gagal mengirim pertanyaan');
      showToast('Gagal memproses pertanyaan.', 'error');
    } finally {
      setIsAsking(false);
    }
  };

  const handleClearHistory = () => {
    showConfirmModal({
      title: 'Hapus Riwayat Percakapan?',
      message: 'Semua pertanyaan dan jawaban dalam sesi tanya AI saat ini akan dibersihkan.',
      confirmLabel: 'Hapus Percakapan',
      cancelLabel: 'Batal',
      isDestructive: true,
      onConfirm: () => {
        clearQaMessages();
        showToast('Riwayat percakapan dibersihkan.', 'info');
      },
    });
  };

  const handleCopyMessage = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      showToast('Jawaban disalin ke clipboard.', 'success');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      showToast('Gagal menyalin.', 'error');
    }
  };

  if (!editedTranscript.trim()) {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center text-txt-muted">
        <div className="w-12 h-12 rounded-xl bg-bg-base border border-border flex items-center justify-center text-txt-muted mb-3">
          <MessageSquare className="w-6 h-6 text-terracotta-600/70" />
        </div>
        <h3 className="text-sm sm:text-base font-bold text-navy-800">
          Belum Ada Transkrip untuk Tanya AI
        </h3>
        <p className="mt-1 text-xs text-txt-muted max-w-sm">
          AI akan menjawab pertanyaan hanya berdasarkan fakta di dalam transkrip. Buat transkripsi terlebih dahulu.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[520px] bg-bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
      {/* Top Header of Chat */}
      <div className="px-4 py-3 border-b border-border bg-bg-base/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-navy-800 text-white flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-terracotta-400" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-navy-800 leading-tight">
              Tanya AI Berdasarkan Rekaman
            </h3>
            <p className="text-[11px] text-txt-muted">
              Menjawab secara ketat hanya dari isi rekaman percakapan
            </p>
          </div>
        </div>

        {qaMessages.length > 0 && (
          <button
            type="button"
            onClick={handleClearHistory}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-txt-muted hover:text-red-600 hover:bg-red-50 rounded-lg border border-border transition-colors"
            title="Bersihkan riwayat percakapan"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Hapus Chat</span>
          </button>
        )}
      </div>

      {/* Message List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
        {qaMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-6">
            <div className="w-10 h-10 rounded-full bg-navy-50 flex items-center justify-center text-navy-700 mb-2">
              <MessageSquare className="w-5 h-5 text-terracotta-600" />
            </div>
            <p className="text-xs sm:text-sm font-bold text-navy-800">
              Mulai Percakapan dengan AI
            </p>
            <p className="mt-1 text-xs text-txt-muted max-w-xs leading-relaxed">
              Ajukan pertanyaan seputar keputusan rapat, penanggung jawab tugas, tenggat waktu, atau topik yang dibahas.
            </p>

            {/* Quick prompt suggestions */}
            <div className="mt-4 flex flex-wrap gap-1.5 justify-center max-w-md">
              {quickQuestions.map((qText, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendQuestion(qText)}
                  className="px-2.5 py-1.5 rounded-lg bg-bg-base hover:bg-bg-subtle border border-border text-[11px] text-navy-800 font-medium transition-colors text-left"
                >
                  "{qText}"
                </button>
              ))}
            </div>
          </div>
        ) : (
          qaMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-navy-800 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4 text-terracotta-400" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3 text-xs sm:text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-navy-800 text-white rounded-tr-sm shadow-sm'
                    : 'bg-bg-base/70 text-navy-900 border border-border rounded-tl-sm shadow-card'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1 text-[10px] opacity-75">
                  <span className="font-semibold">
                    {msg.role === 'user' ? 'Anda' : 'Asisten Rangkum.in'}
                  </span>
                  <span>{msg.timestamp}</span>
                </div>

                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* References if any */}
                {msg.references && msg.references.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-border/50 text-[11px] text-terracotta-700">
                    <span className="font-semibold">Referensi Segmen: </span>
                    {msg.references.join(', ')}
                  </div>
                )}

                {msg.role === 'assistant' && (
                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleCopyMessage(msg.id, msg.content)}
                      className="p-1 rounded text-txt-muted hover:text-navy-800 transition-colors"
                      title="Salin jawaban"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-terracotta-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))
        )}

        {isAsking && (
          <div className="flex items-center gap-2 text-txt-muted text-xs p-2">
            <Loader2 className="w-4 h-4 animate-spin text-terracotta-600" />
            <span>Menganalisis transkrip...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendQuestion();
        }}
        className="p-3 bg-bg-base/40 border-t border-border flex items-center gap-2"
      >
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Tanyakan hal spesifik seputar isi rekaman..."
          disabled={isAsking}
          className="flex-1 px-3.5 py-2.5 bg-bg-surface text-xs sm:text-sm text-navy-900 rounded-xl border border-border focus:border-terracotta-500 focus:outline-none placeholder-txt-muted/60"
        />
        <button
          type="submit"
          disabled={!question.trim() || isAsking}
          className="p-2.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shrink-0 active:scale-95"
          aria-label="Kirim Pertanyaan"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
