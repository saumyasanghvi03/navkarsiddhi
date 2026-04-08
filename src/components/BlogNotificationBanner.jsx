import React, { useState } from 'react';
import { useNav } from '../lib/navContext';

const BANNER_KEY = 'blog_notification_2026-04-08';

const BlogNotificationBanner = () => {
  const { setPage } = useNav();
  const [dismissed, setDismissed] = useState(() => {
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

  const openBlog = () => {
    setPage('blog');
    dismiss();
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed top-0 left-0 right-0 z-[199] flex items-center justify-center px-3 pt-3 pointer-events-none"
    >
      <div className="pointer-events-auto flex items-center gap-2 bg-amber-700 text-white text-sm font-medium px-4 py-2.5 rounded-full shadow-lg max-w-sm w-full sm:w-auto">
        <span className="text-base leading-none">✨</span>
        <span className="flex-1 text-center sm:text-left">New blog post — New Tracks Added to Bhakti Mode!</span>
        <button
          onClick={openBlog}
          className="underline underline-offset-2 whitespace-nowrap hover:text-amber-200 transition-colors text-xs font-semibold"
        >
          Read&nbsp;now
        </button>
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="ml-1 hover:text-amber-200 transition-colors flex-shrink-0"
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
