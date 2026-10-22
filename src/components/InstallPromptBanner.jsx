"use client";

import React, { useState, useEffect } from 'react';
import { hasInstallPromptAvailable, showInstallPrompt, isRunningStandalone } from '../lib/pwaInstall';

const STORAGE_KEY = 'install_prompt_last_dismissed';
const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;
const APK_URL = 'https://navkarsiddhi.vercel.app/navkar-siddhi-v2.apk';

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

  const isAndroid = typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent);

  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed bottom-16 left-0 right-0 z-[197] flex items-center justify-center px-3 pb-2 pointer-events-none"
    >
      <div className="pointer-events-auto bg-gradient-to-r from-orange-900 to-orange-700 text-white rounded-2xl shadow-xl max-w-sm w-full overflow-hidden">
        <div className="flex items-start gap-3 px-4 pt-3.5 pb-1">
          <span className="text-2xl flex-shrink-0 mt-0.5">📲</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold leading-snug">Get the full app experience</p>
            <p className="text-[11px] text-orange-200 mt-0.5 leading-snug">
              Volume button counting · Wrist companion · Home screen widget
            </p>
          </div>
          <button
            onClick={dismiss}
            aria-label="Dismiss"
            className="flex-shrink-0 hover:text-orange-300 transition-colors mt-0.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex gap-2 px-4 pb-3.5 pt-2">
          <button
            onClick={install}
            className="flex-1 bg-white text-orange-800 text-xs font-bold py-2 rounded-xl hover:bg-orange-50 transition-colors"
          >
            Add to Home Screen
          </button>
          {isAndroid && (
            <a
              href={APK_URL}
              onClick={dismiss}
              className="flex-1 bg-orange-600 text-white text-xs font-bold py-2 rounded-xl text-center hover:bg-orange-500 transition-colors"
            >
              Download APK
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstallPromptBanner;
