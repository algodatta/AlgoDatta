"use client";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

type ToastType = "info" | "success" | "error" | "warning";

export type ToastOptions = {
  type?: ToastType;
  duration?: number; // ms
};

type ToastItem = {
  id: number;
  message: string;
  type: ToastType;
  expiresAt: number;
};

type ToastContextValue = {
  notify: (message: string, options?: ToastOptions) => void;
  success: (message: string, options?: Omit<ToastOptions, "type">) => void;
  error: (message: string, options?: Omit<ToastOptions, "type">) => void;
  info: (message: string, options?: Omit<ToastOptions, "type">) => void;
  warning: (message: string, options?: Omit<ToastOptions, "type">) => void;
};

const ToastCtx = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) {
    throw new Error("useToast must be used within <ToastProvider />");
  }
  return ctx;
}

export function ToastProvider() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(1);

  const remove = useCallback((id: number) => {
    setToasts(t => t.filter(x => x.id != id));
  }, []);

  const notify = useCallback((message: string, options?: ToastOptions) => {
    const id = idRef.current++;
    const duration = Math.max(800, options?.duration ?? 3800);
    const type: ToastType = options?.type ?? "info";
    const expiresAt = Date.now() + duration;
    setToasts(t => [...t, { id, message, type, expiresAt }]);
    // auto-remove
    window.setTimeout(() => remove(id), duration + 50);
  }, [remove]);

  const api = useMemo<ToastContextValue>(() => ({
    notify,
    success: (m, o) => notify(m, { ...o, type: "success" }),
    error:   (m, o) => notify(m, { ...o, type: "error" }),
    info:    (m, o) => notify(m, { ...o, type: "info" }),
    warning: (m, o) => notify(m, { ...o, type: "warning" }),
  }), [notify]);

  // prune expired on focus (in case computer slept)
  useEffect(() => {
    const onFocus = () => setToasts(t => t.filter(x => x.expiresAt > Date.now()));
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  return (
    <ToastCtx.Provider value={api}>
      <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            role="status"
            aria-live="polite"
            className={
              "pointer-events-auto min-w-[260px] max-w-[420px] rounded-xl border px-4 py-3 shadow-lg bg-white/95 backdrop-blur " +
              (t.type === "success" ? "border-emerald-300" :
               t.type === "error"   ? "border-rose-300"    :
               t.type === "warning" ? "border-amber-300"   : "border-slate-300")
            }
          >
            <div className="text-sm leading-snug text-slate-800">
              {t.message}
            </div>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
