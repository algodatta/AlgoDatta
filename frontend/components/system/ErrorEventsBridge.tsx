"use client";
import { useEffect } from "react";
import { useToast } from "./Toasts";

export function ErrorEventsBridge() {
  const toastApi = useToast();
  useEffect(() => {
    const onUnhandledRejection = (e: PromiseRejectionEvent) => {
      const reason = (e && (e.reason?.message || String(e.reason))) || "Unhandled rejection";
      try { toastApi.error(reason); } catch {}
    };
    const onWindowError = (e: ErrorEvent) => {
      const msg = (e && (e.message || String(e.error || e))) || "Window error";
      try { toastApi.error(msg); } catch {}
    };
    window.addEventListener("unhandledrejection", onUnhandledRejection);
    window.addEventListener("error", onWindowError);
    return () => {
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
      window.removeEventListener("error", onWindowError);
    };
  }, []);
  return null;
}