'use client';

import { useEffect, useRef } from 'react';

// Module-level counter — survives reset() re-mounts, resets on full page reload
const autoRetry = { count: 0 };

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const fired = useRef(false);

  useEffect(() => {
    console.error('Error boundary caught:', error);

    // Auto-recover for first 2 crashes — silently reset after a short pause
    if (autoRetry.count < 2 && !fired.current) {
      fired.current = true;
      autoRetry.count += 1;
      const t = setTimeout(reset, 600);
      return () => clearTimeout(t);
    }
  }, [error, reset]);

  // While auto-recovering, show a neutral loading screen instead of the error UI
  if (autoRetry.count < 2) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-[#FDFBF7]">
        <div className="text-center space-y-3">
          <div className="text-5xl animate-pulse">📿</div>
          <p className="text-sm text-slate-400">Loading…</p>
        </div>
      </div>
    );
  }

  // Retries exhausted — show the error UI with details
  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-[#FDFBF7] px-6">
      <div className="max-w-md w-full rounded-2xl border border-teal-100 bg-white shadow-md p-6 text-center space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-teal-600">Navkar Siddhi Tap</p>
        <h2 className="text-2xl font-semibold text-teal-900">Something went wrong</h2>
        <p className="text-sm text-slate-600">
          Your session is safe. Please retry, and continue your mantra practice when ready.
        </p>
        {error?.message && (
          <p className="text-[11px] font-mono text-left bg-slate-50 rounded-lg p-2 text-slate-500 break-all">
            {error.message}
          </p>
        )}
        <button
          onClick={() => { autoRetry.count = 0; reset(); }}
          className="inline-flex items-center justify-center rounded-full bg-teal-600 text-white px-5 py-2 text-sm font-medium hover:bg-teal-700 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
