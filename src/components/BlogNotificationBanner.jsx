import React, { useState } from 'react';
const BANNER_KEY = 'notification_2026-09-07';

const BlogNotificationBanner = () => {
  const [dismissed, setDismissed] = useState(() => {
    // Expire banner after September 16, 2026
    const now = new Date();
    const expiryDate = new Date('2026-09-17T00:00:00');
    if (now >= expiryDate) return true;

    try {
      return localStorage.getItem(BANNER_KEY) === 'dismissed';
    } catch (_) {
      return false;
    }
  });

  if (dismissed) return null;

  const dismiss = () => {
    try { localStorage.setItem(BANNER_KEY, 'dismissed'); } catch (_) {}
    setDismissed(true);
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed top-0 left-0 right-0 z-[199] flex items-center justify-center px-3 pt-3 pointer-events-none"
    >
      <div className="pointer-events-auto relative overflow-hidden flex items-center gap-2 bg-white text-black text-sm font-semibold px-4 py-2.5 rounded-full shadow-lg max-w-sm w-full sm:w-auto border-2 border-amber-400">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff_0%,#ffffff_20%,#dc2626_20%,#dc2626_40%,#facc15_40%,#facc15_60%,#16a34a_60%,#16a34a_80%,#111827_80%,#111827_100%)] opacity-20" />
        <span className="relative text-base leading-none">🕉️</span>
        <span className="relative flex-1 text-center sm:text-left">Paryushan 2026 ongoing: 7th Sep to 15th Sep 2026</span>
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="relative ml-1 hover:text-amber-700 transition-colors flex-shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default BlogNotificationBanner;
