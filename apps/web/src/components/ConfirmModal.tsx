import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useSessionStore } from '../store/useSessionStore';

export const ConfirmModal: React.FC = () => {
  const { confirmModal, dismissConfirmModal } = useSessionStore();

  if (!confirmModal) return null;

  const {
    title,
    message,
    confirmLabel = 'Lanjutkan',
    cancelLabel = 'Batal',
    isDestructive = false,
    onConfirm,
  } = confirmModal;

  const handleConfirm = () => {
    onConfirm();
    dismissConfirmModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md glass-strong rounded-2xl shadow-glass p-6 overflow-hidden">
        {/* Accent top line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-terracotta-500/50 to-transparent" />

        <button type="button" onClick={dismissConfirmModal} className="absolute top-4 right-4 p-1.5 text-txt-muted hover:text-txt-primary rounded-lg hover:bg-white/[0.08] transition-colors" aria-label="Tutup">
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg flex-shrink-0 ${isDestructive ? 'bg-red-500/15 text-red-400' : 'bg-terracotta-600/15 text-terracotta-400'}`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1 pr-6">
            <h3 className="text-sm font-bold text-txt-primary">{title}</h3>
            <p className="mt-1.5 text-xs text-txt-muted leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button type="button" onClick={dismissConfirmModal} className="px-3.5 py-2 text-xs font-semibold rounded-lg text-txt-muted hover:text-txt-primary bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] transition-all">
            {cancelLabel}
          </button>
          <button type="button" onClick={handleConfirm} className={`px-4 py-2 text-xs font-bold rounded-lg text-white transition-all active:scale-[0.97] ${isDestructive ? 'bg-red-600/90 hover:bg-red-600 shadow-[0_0_16px_rgba(239,68,68,0.3)]' : 'btn-primary'}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
