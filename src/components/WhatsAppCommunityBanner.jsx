import React, { useState } from 'react';
import { useNav } from '../lib/navContext';

const STORAGE_KEY = 'game_banner_dismissed_v1';
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const GameBanner = () => {
  const { setPage } = useNav();

  const [dismissed, setDismissed] = useState(() => {
    try {
      const last = localStorage.getItem(STORAGE_KEY);
      if (!last) return false;
      return Date.now() - Number(last) < ONE_WEEK_MS;
    } catch (_) {
      return false;
    }
  });

  if (dismissed) return null;

  const dismiss = () => {
    try { localStorage.setItem(STORAGE_KEY, String(Date.now())); } catch (_) {}
    setDismissed(true);
  };

  const openGame = () => {
    setPage('game');
    dismiss();
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed bottom-0 left-0 right-0 z-[198] flex items-center justify-center px-3 pb-4 pointer-events-none"
    >
      <div className="pointer-events-auto flex items-center gap-2 bg-gradient-to-r from-purple-700 to-indigo-600 text-white text-sm font-medium px-4 py-2.5 rounded-full shadow-lg max-w-sm w-full sm:w-auto">
        <span className="text-base flex-shrink-0">🎮</span>
        <span className="flex-1 text-center sm:text-left">Karma Bubble game is live — pop karma, count navkars!</span>
        <button
          onClick={openGame}
          className="underline underline-offset-2 whitespace-nowrap hover:text-purple-200 transition-colors text-xs font-semibold"
        >
          Play&nbsp;now
        </button>
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="ml-1 hover:text-purple-200 transition-colors flex-shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default GameBanner;
