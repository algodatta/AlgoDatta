"use client";
import React from "react";
import { useToast } from "@/components/system/Toasts";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const toastApi = useToast();
  React.useEffect(() => {
    try { toastApi.error(error?.message || "Route error"); } catch {}
    console.error("Route error page:", error);
  }, [error]);

  return (
    <div className="min-h-[50vh] grid place-items-center p-6">
      <div className="max-w-lg text-center">
        <h1 className="text-2xl font-semibold mb-2">Something went wrong</h1>
        {error?.message && (
          <p className="text-sm text-gray-600 mb-4">{error.message}</p>
        )}
        <div className="flex items-center justify-center gap-3">
          <button className="px-4 py-2 rounded-lg border" onClick={() => reset()}>
            Try again
          </button>
          <a href="/" className="px-4 py-2 rounded-lg bg-black text-white">
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}