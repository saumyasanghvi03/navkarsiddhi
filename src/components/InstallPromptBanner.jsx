import React, { useState, useEffect } from 'react';
import { hasInstallPromptAvailable, showInstallPrompt, isRunningStandalone } from '../lib/pwaInstall';

const STORAGE_KEY = 'install_prompt_last_dismissed';
const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;

/**
 * Offers "Add to Home Screen" on Android Chrome (the only browser that fires
 * beforeinstallprompt) — an installed PWA gets much stronger storage
 * persistence guarantees than a bare browser tab, which is what this exists
 * to encourage. Positioned above WhatsAppCommunityBanner's bottom-0 slot so
 * the two don't overlap if both happen to be showing.
 */
const InstallPromptBanner = () => {
  const [available, setAvailable] = useState(false);

  const [dismissed, setDismissed] = useState(() => {
    try {
      const last = localStorage.getItem(STORAGE_KEY);
      if (!last) return false;
      return Date.now() - Number(last) < TWO_WEEKS_MS;
    } catch (_) {
      return false;
    }
  });

  useEffect(() => {
    if (isRunningStandalone()) return;
    setAvailable(hasInstallPromptAvailable());
    const handleAvailable = () => setAvailable(true);
    const handleInstalled = () => setAvailable(false);
    window.addEventListener('pwaInstallAvailable', handleAvailable);
    window.addEventListener('appinstalled', handleInstalled);
    return () => {
      window.removeEventListener('pwaInstallAvailable', handleAvailable);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  if (dismissed || !available || isRunningStandalone()) return null;

  const dismiss = () => {
    try { localStorage.setItem(STORAGE_KEY, String(Date.now())); } catch (_) { /* ignore */ }
    setDismissed(true);
  };

  const install = async () => {
    const result = await showInstallPrompt();
    if (result.outcome !== 'unavailable') dismiss();
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed bottom-16 left-0 right-0 z-[197] flex items-center justify-center px-3 pb-2 pointer-events-none"
    >
      <div className="pointer-events-auto flex items-center gap-2 bg-orange-800 text-white text-sm font-medium px-4 py-2.5 rounded-full shadow-lg max-w-sm w-full sm:w-auto">
        <span className="text-base flex-shrink-0">📲</span>
        <span className="flex-1 text-center sm:text-left">Add Navkar Siddhi to your home screen — keeps your progress safer too.</span>
        <button
          onClick={install}
          className="underline underline-offset-2 whitespace-nowrap hover:text-orange-200 transition-colors text-xs font-semibold"
        >
          Install
        </button>
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="ml-1 hover:text-orange-200 transition-colors flex-shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default InstallPromptBanner;
