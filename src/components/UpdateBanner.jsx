import React, { useState, useEffect } from 'react';

/**
 * UpdateBanner — shown automatically when a new version of the app is deployed.
 * Listens for the `swUpdateAvailable` custom event dispatched by ServiceWorkerRegister.
 * Counts down 3 seconds then reloads — no user action required.
 */
const UpdateBanner = () => {
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    const handleUpdate = () => setCountdown(3);
    window.addEventListener('swUpdateAvailable', handleUpdate);
    return () => window.removeEventListener('swUpdateAvailable', handleUpdate);
  }, []);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      window.location.reload();
      return;
    }
    const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  if (countdown === null) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed top-0 left-0 right-0 z-[200] flex items-center justify-center px-4 pt-3 pointer-events-none"
    >
      <div className="pointer-events-auto flex items-center gap-3 bg-orange-700 text-white text-sm font-medium px-5 py-3 rounded-full shadow-lg">
        <svg
          className="w-4 h-4 animate-spin flex-shrink-0"
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span>New version available — refreshing in {countdown}s…</span>
      </div>
    </div>
  );
};

export default UpdateBanner;

