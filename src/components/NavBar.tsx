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
  const lastScrollY = useRef(0);
  const scrollContainer = useRef<Element | null>(null);

  // Always show on page change
  useEffect(() => {
    setVisible(true);
    lastScrollY.current = 0;
  }, [page]);

  // Scroll-based hide/show: hide on scroll down, show on scroll up or at top
  useEffect(() => {
    const getScrollY = () => {
      // Try the main scrollable element — document.documentElement or body
      return window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
    };

    const onScroll = () => {
      const currentY = getScrollY();
      const delta = currentY - lastScrollY.current;

      if (currentY <= 10) {
        // At or near top — always show
        setVisible(true);
      } else if (delta > 4) {
        // Scrolling down
        setVisible(false);
      } else if (delta < -4) {
        // Scrolling up
        setVisible(true);
      }

      lastScrollY.current = currentY;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      {/* Peek strip — always visible when nav hidden, tap to reveal */}
      {!visible && (
        <div
          className="fixed top-0 left-0 right-0 z-50 h-1.5 bg-orange-400/60 cursor-pointer"
          onClick={() => setVisible(true)}
          onMouseEnter={() => setVisible(true)}
          aria-label="Show navigation"
        />
      )}

      <nav
        className={`fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-orange-100 safe-area-top transition-transform duration-250 ${
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
    </>
  );
};

export default NavBar;
