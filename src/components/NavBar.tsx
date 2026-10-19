"use client";

import React, { useState, useEffect, useRef } from 'react';
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
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navRef = useRef<HTMLElement>(null);

  const scheduleHide = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setVisible(false), 3000);
  };

  const showAndScheduleHide = () => {
    setVisible(true);
    scheduleHide();
  };

  // Hide after 3s on mount, re-show on page change
  useEffect(() => {
    scheduleHide();
    return () => { if (hideTimer.current) clearTimeout(hideTimer.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    showAndScheduleHide();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // Touch at top edge of screen reveals navbar
  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches[0].clientY < 30) showAndScheduleHide();
    };
    document.addEventListener('touchstart', onTouchStart, { passive: true });
    return () => document.removeEventListener('touchstart', onTouchStart);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/* Peek strip — always visible, tap to reveal full navbar */}
      {!visible && (
        <div
          className="fixed top-0 left-0 right-0 z-50 h-1.5 bg-orange-400/60 cursor-pointer"
          onClick={showAndScheduleHide}
          onMouseEnter={showAndScheduleHide}
          aria-label="Show navigation"
        />
      )}

      <nav
        ref={navRef}
        className={`fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-orange-100 safe-area-top transition-transform duration-250 ${
          visible ? 'translate-y-0' : '-translate-y-full'
        }`}
        onMouseEnter={() => { if (hideTimer.current) clearTimeout(hideTimer.current); }}
        onMouseLeave={scheduleHide}
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
    </>
  );
};

export default NavBar;
