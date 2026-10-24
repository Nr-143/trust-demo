import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed? This action cannot be undone.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  confirmVariant = 'danger', // 'danger' | 'warning' | 'primary'
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  const buttonColors = {
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    warning: 'bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500',
    primary: 'bg-primary hover:bg-primary-dark text-white focus:ring-primary',
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
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 p-1 -mr-2 -mt-2 rounded-lg"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-semibold text-gray-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors shadow-2xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              buttonColors[confirmVariant] || buttonColors.danger
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

