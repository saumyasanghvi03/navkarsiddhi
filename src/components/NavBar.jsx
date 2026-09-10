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
      <div className="flex items-center justify-between max-w-lg mx-auto px-2 h-12">
        <span className="text-sm font-serif font-bold text-orange-800 tracking-wide pl-2 hidden sm:block">
          Navkar Siddhi
        </span>
        <div className="flex items-center gap-3">
          <ConnectivityIndicator />
          <div className="flex items-center gap-1 mx-auto sm:mx-0">
            {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setPage(t.id)}
              className={`
                px-2 py-1.5 rounded-full text-xs font-medium transition-all
                ${page === t.id
                  ? 'bg-orange-100 text-orange-800'
                  : 'text-gray-500 hover:text-orange-700 hover:bg-orange-50'}
              `}
            >
              <span className="mr-1">{t.icon}</span>
              {t.label}
            </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
