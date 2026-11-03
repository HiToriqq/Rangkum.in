import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useSessionStore } from '../store/useSessionStore';

export const Toast: React.FC = () => {
  const { toast, dismissToast } = useSessionStore();

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      dismissToast();
    }, 4500);

    return () => clearTimeout(timer);
  }, [toast, dismissToast]);

  if (!toast) return null;

  const { message, type } = toast;

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />,
    info: <Info className="w-4 h-4 text-navy-600 flex-shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-200 bg-emerald-50/90 text-emerald-900',
    error: 'border-red-200 bg-red-50/90 text-red-900',
    info: 'border-navy-200 bg-navy-50/90 text-navy-900',
    warning: 'border-amber-200 bg-amber-50/90 text-amber-900',
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full animate-bounce-subtle pointer-events-auto">
      <div
        className={`flex items-start gap-2.5 p-3.5 rounded-xl border shadow-hover backdrop-blur-md transition-all ${borders[type]}`}
      >
        <div className="mt-0.5">{icons[type]}</div>
        <p className="flex-1 text-xs sm:text-sm font-medium leading-snug">{message}</p>
        <button
          type="button"
          onClick={dismissToast}
          className="p-1 -mr-1 text-txt-muted hover:text-navy-800 rounded-md hover:bg-black/5 transition-colors"
          aria-label="Tutup notifikasi"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
