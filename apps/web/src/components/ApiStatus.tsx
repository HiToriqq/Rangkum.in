import React, { useEffect, useState } from 'react';
import { getApiHealth, type ApiHealth } from '../lib/api';

type Status = 'checking' | 'connected' | 'unavailable';

export const ApiStatus: React.FC = () => {
  const [status, setStatus] = useState<Status>('checking');
  const [health, setHealth] = useState<ApiHealth | null>(null);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    const check = async () => {
      try {
        const result = await getApiHealth(controller.signal);
        if (active) {
          setHealth(result);
          setStatus('connected');
        }
      } catch {
        if (active) {
          setHealth(null);
          setStatus('unavailable');
        }
      }
    };

    void check();
    const intervalId = window.setInterval(() => void check(), 30000);

    return () => {
      active = false;
      controller.abort();
      window.clearInterval(intervalId);
    };
  }, []);

  const isWarning =
    status === 'connected' &&
    (!health?.providers.sttConfigured ||
      !health?.providers.llmConfigured ||
      health?.providers.stt === 'mock' ||
      health?.providers.llm === 'mock');

  const dotColor =
    status === 'checking'
      ? 'bg-gray-400 animate-pulse'
      : status === 'unavailable'
        ? 'bg-red-500'
        : isWarning
          ? 'bg-amber-500'
          : 'bg-emerald-500';

  const label =
    status === 'checking'
      ? 'Memeriksa...'
      : status === 'unavailable'
        ? 'Tidak Terhubung'
        : isWarning
          ? 'Terhubung · Periksa Konfigurasi'
          : 'Terhubung';

  return (
    <div
      className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-[11px] font-medium text-txt-muted"
      role="status"
      aria-live="polite"
      title={status === 'connected' ? `STT: ${health?.providers.stt ?? '-'} · LLM: ${health?.providers.llm ?? '-'}` : undefined}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      {label}
    </div>
  );
};
