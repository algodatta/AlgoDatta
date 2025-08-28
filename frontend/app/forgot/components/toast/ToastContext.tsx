'use client';
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type Toast = {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
  duration?: number; // ms
};

type Ctx = {
  toasts: Toast[];
  push: (t: Omit<Toast, 'id'>) => void;
  dismiss: (id: string) => void;
  clear: () => void;
};

const ToastCtx = createContext<Ctx | null>(null);

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}

function ToastItem({ t, onDismiss }: { t: Toast; onDismiss: (id: string) => void }) {
  const v = t.variant || 'default';
  const classes: Record<string, string> = {
    default: 'bg-white border-slate-200 text-slate-900',
    success: 'bg-emerald-600 text-white',
    warning: 'bg-amber-500 text-white',
    error: 'bg-rose-600 text-white',
  };
  return (
    <div className={`rounded-2xl border shadow-md px-4 py-3 relative ${classes[v]}`}>
      {t.title && <div className="font-semibold">{t.title}</div>}
      {t.description && <div className="text-sm opacity-90">{t.description}</div>}
      <button onClick={() => onDismiss(t.id)} className="absolute top-2 right-2 text-sm/none opacity-70 hover:opacity-100">×</button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts(list => list.filter(x => x.id !== id));
  }, []);

  const push = useCallback((t: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2, 9);
    const toast: Toast = { id, duration: 4000, ...t };
    setToasts(list => [toast, ...list]);
    if (toast.duration && toast.duration > 0) {
      setTimeout(() => dismiss(id), toast.duration);
    }
  }, [dismiss]);

  const clear = useCallback(() => setToasts([]), []);

  const value = useMemo<Ctx>(() => ({ toasts, push, dismiss, clear }), [toasts, push, dismiss, clear]);

  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div className="fixed inset-x-0 top-4 z-50 flex justify-center pointer-events-none">
        <div className="w-full max-w-md px-4 space-y-2 pointer-events-auto relative">
          {toasts.map(t => <ToastItem key={t.id} t={t} onDismiss={dismiss} />)}
        </div>
      </div>
    </ToastCtx.Provider>
  );
}
