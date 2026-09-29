"use client";

import React from 'react';
import { useNav } from '../lib/navContext';
import ConnectivityIndicator from './ConnectivityIndicator';

const tabs = [
  { id: 'jaap', label: 'Jaap', icon: '🙏' },
  { id: 'about', label: 'About', icon: '📖' },
  { id: 'tapsetup', label: 'Tap', icon: '🎯' },
  { id: 'progress', label: 'Progress', icon: '📊' },
  { id: 'blog', label: 'Blog', icon: '✍️' },
  { id: 'vibes', label: 'Vibes', icon: '✨' },
  { id: 'contact', label: 'Contact', icon: '📞' },
];

const NavBar = () => {
  const { page, setPage } = useNav();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-orange-100 safe-area-top">
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
            <span className="sm:mr-1">{t.icon}</span>
            <span className="hidden sm:inline">{t.label}</span>
          </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
