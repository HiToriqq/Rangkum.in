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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/50 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-bg-surface rounded-xl border border-border shadow-hover p-6 overflow-hidden">
        <button
          type="button"
          onClick={dismissConfirmModal}
          className="absolute top-4 right-4 p-1 text-txt-muted hover:text-navy-800 rounded-md hover:bg-bg-subtle transition-colors"
          aria-label="Tutup"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3">
          <div
            className={`p-2 rounded-lg flex-shrink-0 ${
              isDestructive
                ? 'bg-red-50 text-red-600'
                : 'bg-terracotta-50 text-terracotta-700'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-navy-800">{title}</h3>
            <p className="mt-1.5 text-xs sm:text-sm text-txt-muted leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={dismissConfirmModal}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg text-txt-primary hover:bg-bg-subtle border border-border transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`px-4 py-2 text-xs font-semibold rounded-lg text-white transition-all shadow-sm active:scale-[0.98] ${
              isDestructive
                ? 'bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-400'
                : 'bg-navy-800 hover:bg-navy-700 focus:ring-2 focus:ring-navy-500'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
