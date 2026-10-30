import { useState } from 'react';
import { AlertTriangle, Loader2, X } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed? This action cannot be undone.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  confirmVariant = 'danger', // 'danger' | 'warning' | 'primary'
  isLoading: propLoading = false,
  onConfirm,
  onCancel,
}) {
  const [internalLoading, setInternalLoading] = useState(false);
  const loading = propLoading || internalLoading;

  if (!isOpen) return null;

  const buttonColors = {
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    warning: 'bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500',
    primary: 'bg-primary hover:bg-primary-dark text-white focus:ring-primary',
  };

  const handleConfirmClick = async (e) => {
    if (loading) return;
    try {
      setInternalLoading(true);
      await onConfirm?.(e);
    } finally {
      setInternalLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div
        className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200 transform transition-all animate-scaleUp"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-red-50 rounded-xl text-red-600 shrink-0">
            <AlertTriangle size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 leading-snug">{title}</h3>
            <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">{message}</p>
          </div>
          <button
            onClick={loading ? undefined : onCancel}
            disabled={loading}
            className={`text-gray-400 p-1 -mr-2 -mt-2 rounded-lg transition-colors ${
              loading ? 'opacity-40 cursor-not-allowed' : 'hover:text-gray-600 cursor-pointer'
            }`}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className={`px-4 py-2 text-sm font-semibold text-gray-700 bg-stone-100 rounded-xl transition-colors ${
              loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-stone-200 cursor-pointer'
            }`}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirmClick}
            disabled={loading}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all shadow-2xs focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              loading
                ? 'opacity-70 cursor-not-allowed bg-stone-400 text-white'
                : `${buttonColors[confirmVariant] || buttonColors.danger} cursor-pointer`
            }`}
          >
            {loading && <Loader2 size={16} className="animate-spin shrink-0" />}
            <span>{loading ? 'Processing...' : confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
