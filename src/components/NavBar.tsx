"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useNav } from '../lib/navContext';
import ConnectivityIndicator from './ConnectivityIndicator';

type Lang = 'english' | 'hindi' | 'gujarati';

const TAB_LABELS: Record<string, Record<Lang, string>> = {
  jaap:      { english: 'Jaap',     hindi: 'जाप',    gujarati: 'જાપ'    },
  about:     { english: 'About',    hindi: 'परिचय',  gujarati: 'પરિચય'  },
  tapsetup:  { english: 'Tap',      hindi: 'तप',     gujarati: 'તપ'     },
  progress:  { english: 'Progress', hindi: 'प्रगति', gujarati: 'પ્રગતિ' },
  companion: { english: 'Me',       hindi: 'मैं',    gujarati: 'હું'    },
  blog:      { english: 'Blog',     hindi: 'ब्लॉग',  gujarati: 'બ્લૉગ'  },
  vibes:     { english: 'Vibes',    hindi: 'वाइब्स', gujarati: 'વાઇબ્સ' },
  contact:   { english: 'Contact',  hindi: 'संपर्क', gujarati: 'સંપર્ક' },
};

const tabs = [
  { id: 'jaap',      icon: '🙏' },
  { id: 'about',     icon: '📖' },
  { id: 'tapsetup',  icon: '🎯' },
  { id: 'progress',  icon: '📊' },
  { id: 'companion', icon: '🧘' },
  { id: 'blog',      icon: '✍️' },
  { id: 'vibes',     icon: '✨' },
  { id: 'contact',   icon: '📞' },
];

const NavBar = () => {
  const { page, setPage: _setPage, language } = useNav();
  const setPage = _setPage as (page: string) => void;
  const lang = (language as Lang) || 'english';
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  // Always show on page change
  useEffect(() => {
    setVisible(true);
    lastScrollY.current = 0;
  }, [page]);

  // Hide on scroll down, show on scroll up or at top
  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY || document.documentElement.scrollTop || 0;
      const delta = currentY - lastScrollY.current;
      if (currentY <= 10) {
        setVisible(true);
      } else if (delta > 4) {
        setVisible(false);
      } else if (delta < -4) {
        setVisible(true);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
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
                <span>{TAB_LABELS[t.id]?.[lang] ?? TAB_LABELS[t.id]?.english}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
};

export default NavBar;
