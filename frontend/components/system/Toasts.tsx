"use client";
import { ToastProvider } from "./toast/ToastProvider";

export function Toasts() {
  return <ToastProvider />;
}

// Re-export hook for convenience if needed elsewhere
export { useToast } from "./toast/ToastProvider";
