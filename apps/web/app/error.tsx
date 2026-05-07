"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Disha AI Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#050508] flex items-center justify-center px-4">
      <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
      <div className="relative z-10 text-center max-w-md">
        <div className="w-20 h-20 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-rose-400" />
        </div>
        <h1 className="font-display text-2xl font-bold text-white mb-3">Something went wrong</h1>
        <p className="text-slate-400 text-sm mb-2">
          Disha hit an unexpected error. Don&apos;t worry — your data is safe.
        </p>
        {error.message && (
          <p className="text-xs text-slate-600 glass rounded-lg px-3 py-2 mb-8 font-mono">
            {error.message}
          </p>
        )}
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="btn-primary flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Try Again
          </button>
          <a href="/" className="btn-secondary flex items-center gap-2">
            <Home className="w-4 h-4" /> Go Home
          </a>
        </div>
      </div>
    </div>
  );
}
