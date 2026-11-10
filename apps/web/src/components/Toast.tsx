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
    success: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
    error:   'border-red-500/20 bg-red-500/10 text-red-300',
    info:    'border-white/10 bg-white/[0.07] text-txt-primary',
    warning: 'border-amber-500/20 bg-amber-500/10 text-amber-300',
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full animate-fade-in pointer-events-auto">
      <div className={`flex items-start gap-2.5 p-3.5 rounded-xl border shadow-glass backdrop-blur-xl transition-all ${borders[type]}`}>
        <div className="mt-0.5">{icons[type]}</div>
        <p className="flex-1 text-xs sm:text-sm font-medium leading-snug">{message}</p>
        <button type="button" onClick={dismissToast} className="p-1 -mr-1 text-txt-muted hover:text-txt-primary rounded-md hover:bg-white/10 transition-colors" aria-label="Tutup notifikasi">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
