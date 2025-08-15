"use client";
import React from "react";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html>
      <body>
        <div className="min-h-screen grid place-items-center p-6">
          <div className="max-w-lg text-center">
            <h1 className="text-2xl font-semibold mb-2">Critical error</h1>
            <p className="text-sm text-gray-600 mb-4">
              {error?.message || "Unknown error"}
            </p>
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
      </body>
    </html>
  );
}