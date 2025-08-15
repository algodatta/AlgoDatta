"use client";
import React from "react";
type Props = { children: React.ReactNode };

type State = { hasError: boolean; message?: string };

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any): State {
    const msg = (error && (error.message || String(error))) || "Unknown error";
    return { hasError: true, message: msg };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught:", error, errorInfo);
    const msg = (error && (error.message || String(error))) || "Unknown error";
    // Surface in UI without crashing the app
    try { toast.error(msg); } catch {}
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen grid place-items-center p-6">
          <div className="max-w-lg text-center">
            <h1 className="text-2xl font-semibold mb-2">Something went wrong</h1>
            {this.state.message && (
              <p className="text-sm text-gray-600 mb-4">{this.state.message}</p>
            )}
            <div className="flex items-center justify-center gap-3">
              <button
                className="px-4 py-2 rounded-lg border"
                onClick={() => window.location.reload()}
              >
                Try again
              </button>
              <a
                href="/"
                className="px-4 py-2 rounded-lg bg-black text-white"
              >
                Go home
              </a>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}