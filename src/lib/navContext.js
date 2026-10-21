"use client";

import React, { createContext, useContext, useState } from 'react';

/**
 * Simple client-side navigation context.
 * Pages: 'jaap' | 'about' | 'tapsetup' | 'progress' | 'privacy' | 'contact' | 'blog'
 * Language: 'english' | 'hindi' | 'gujarati'
 */
const NavContext = createContext({
  page: 'jaap',
  setPage: (_page) => {},
  language: 'english',
  setLanguage: (_lang) => {},
  pendingAction: null,
  setPendingAction: (_action) => {},
});

export const LANGUAGES = ['english', 'hindi', 'gujarati'];

function readStoredLang() {
  try {
    const stored = typeof window !== 'undefined' && localStorage.getItem('navkar_tts_lang');
    if (stored && LANGUAGES.includes(stored)) return stored;
  } catch (_) {}
  return 'english';
}

export const NavProvider = ({ children }) => {
  const [page, setPage] = useState('jaap');
  const [language, setLanguage] = useState(readStoredLang);
  const [pendingAction, setPendingAction] = useState(null);

  const setLanguagePersisted = (lang) => {
    try { localStorage.setItem('navkar_tts_lang', lang); } catch (_) {}
    setLanguage(lang);
  };

  return (
    <NavContext.Provider value={{ page, setPage, language, setLanguage: setLanguagePersisted, pendingAction, setPendingAction }}>
      {children}
    </NavContext.Provider>
  );
};

export const useNav = () => useContext(NavContext);
