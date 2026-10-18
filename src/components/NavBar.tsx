"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNav } from '../lib/navContext';
import ConnectivityIndicator from './ConnectivityIndicator';

const tabs = [
  { id: 'jaap', label: 'Jaap', icon: '🙏' },
  { id: 'about', label: 'About', icon: '📖' },
  { id: 'tapsetup', label: 'Tap', icon: '🎯' },
  { id: 'progress', label: 'Progress', icon: '📊' },
  { id: 'companion', label: 'Me', icon: '🧘' },
  { id: 'blog', label: 'Blog', icon: '✍️' },
  { id: 'vibes', label: 'Vibes', icon: '✨' },
  { id: 'contact', label: 'Contact', icon: '📞' },
];

const NavBar = () => {
  const { page, setPage } = useNav();
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleScroll = useCallback(() => {
    const y = window.scrollY;
    if (y < 10) {
      setVisible(true);
    } else if (y > lastScrollY.current + 5) {
      setVisible(false); // scrolling down
    } else if (y < lastScrollY.current - 5) {
      setVisible(true); // scrolling up
    }
    lastScrollY.current = y;
  }, []);

  // Auto-hide after 3s of no scroll
  useEffect(() => {
    const resetTimer = () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => {
        if (window.scrollY > 10) setVisible(false);
      }, 3000);
    };

    const onScroll = () => {
      handleScroll();
      resetTimer();
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    resetTimer();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [handleScroll]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 bg-white border-b border-orange-100 safe-area-top transition-transform duration-300 ${
          visible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="flex items-center w-full max-w-lg mx-auto px-2 h-12 gap-2">
          <ConnectivityIndicator />
          <div className="flex items-center gap-0.5 sm:gap-1 overflow-x-auto scrollbar-hide flex-1">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setPage(t.id)}
                className={`
                  flex-shrink-0 px-2 sm:px-2.5 py-1.5 rounded-full text-xs font-medium transition-all
                  ${page === t.id
                    ? 'bg-orange-100 text-orange-800'
                    : 'text-gray-500 hover:text-orange-700 hover:bg-orange-50'}
                `}
              >
                <span className="mr-1">{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>
      {/* Pull-down indicator when navbar is hidden */}
      {!visible && (
        <button
          onClick={() => setVisible(true)}
          className="fixed top-0 left-1/2 -translate-x-1/2 z-50 bg-orange-500/80 text-white rounded-b-lg px-4 py-1 text-xs font-medium backdrop-blur-sm"
        >
          ▼ Menu
        </button>
      )}
    </>
  );
};

export default NavBar;
