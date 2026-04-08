import React, { useState } from 'react';
import { useNav } from '../lib/navContext';

const STORAGE_KEY = 'whatsapp_community_banner_last_dismissed';
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const WHATSAPP_URL = 'https://chat.whatsapp.com/JUJxtRhHmJ0LM6Uk0OH0v5';

const WhatsAppCommunityBanner = () => {
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

  const openAbout = () => {
    setPage('about');
    dismiss();
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed bottom-0 left-0 right-0 z-[198] flex items-center justify-center px-3 pb-4 pointer-events-none"
    >
      <div className="pointer-events-auto flex items-center gap-2 bg-green-700 text-white text-sm font-medium px-4 py-2.5 rounded-full shadow-lg max-w-sm w-full sm:w-auto">
        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        <span className="flex-1 text-center sm:text-left">Join the JainZBharat community on WhatsApp! ⚡</span>
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={dismiss}
          className="underline underline-offset-2 whitespace-nowrap hover:text-green-200 transition-colors text-xs font-semibold"
        >
          Join&nbsp;now
        </a>
        <button
          onClick={openAbout}
          className="underline underline-offset-2 whitespace-nowrap hover:text-green-200 transition-colors text-xs font-semibold"
        >
          Learn&nbsp;more
        </button>
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="ml-1 hover:text-green-200 transition-colors flex-shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default WhatsAppCommunityBanner;
