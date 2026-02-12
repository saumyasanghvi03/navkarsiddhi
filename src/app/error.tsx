'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error boundary caught an exception:', error);
  }, [error]);

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-[#FDFBF7] px-6">
      <div className="max-w-md w-full rounded-2xl border border-teal-100 bg-white shadow-md p-6 text-center space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-teal-600">Navkar Siddhi Tap</p>
        <h2 className="text-2xl font-semibold text-teal-900">Something went wrong</h2>
        <p className="text-sm text-slate-600">
          Your session is safe. Please retry, and continue your mantra practice when ready.
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center justify-center rounded-full bg-teal-600 text-white px-5 py-2 text-sm font-medium hover:bg-teal-700 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
