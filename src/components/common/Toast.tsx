import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

let toastListeners: ((toast: ToastMessage) => void)[] = [];

export const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
  const toast: ToastMessage = {
    id: `toast-${Date.now()}-${Math.random()}`,
    type,
    message,
  };
  toastListeners.forEach(listener => listener(toast));
};

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handleNewToast = (newToast: ToastMessage) => {
      setToasts(prev => [...prev, newToast]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== newToast.id));
      }, 4000);
    };

    toastListeners.push(handleNewToast);
    return () => {
      toastListeners = toastListeners.filter(l => l !== handleNewToast);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-xl bg-brand-surface/95 border border-brand-border shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5 duration-200"
        >
          <div className="flex items-center gap-3">
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-crimson shrink-0" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-gold shrink-0" />}
            <p className="text-sm font-medium text-white">{toast.message}</p>
          </div>
          <button
            onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
            className="text-brand-muted hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
