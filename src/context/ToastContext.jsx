import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type = 'info', title, message, duration = 4000 }) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const newToast = { id, type, title, message };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    [removeToast]
  );

  const showSuccess = useCallback(
    (message, title = 'Success') => showToast({ type: 'success', title, message }),
    [showToast]
  );

  const showError = useCallback(
    (message, title = 'Error') => showToast({ type: 'error', title, message }),
    [showToast]
  );

  const showInfo = useCallback(
    (message, title = 'Note') => showToast({ type: 'info', title, message }),
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, showInfo, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

function ToastContainer({ toasts, onDismiss }) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
      aria-live="polite"
    >
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        const borderClass = isSuccess
          ? 'border-emerald-500 bg-emerald-50 text-emerald-950'
          : isError
          ? 'border-rose-500 bg-rose-50 text-rose-950'
          : 'border-amber-500 bg-amber-50 text-amber-950';

        const Icon = isSuccess ? CheckCircle2 : isError ? AlertCircle : Info;
        const iconColor = isSuccess
          ? 'text-emerald-600'
          : isError
          ? 'text-rose-600'
          : 'text-amber-600';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border-l-4 shadow-lg backdrop-blur-xs transition-all duration-300 transform translate-y-0 ${borderClass}`}
            role="alert"
          >
            <Icon size={20} className={`${iconColor} shrink-0 mt-0.5`} />
            <div className="flex-1 min-w-0">
              {toast.title && <p className="text-xs font-bold uppercase tracking-wider mb-0.5">{toast.title}</p>}
              <p className="text-xs leading-relaxed font-medium">{toast.message}</p>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="p-1 rounded-md text-gray-500 hover:text-gray-800 hover:bg-black/5 transition-colors"
              aria-label="Close notification"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

