"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { isNativeShell } from './nativeWidgetBridge';

/**
 * Simple client-side navigation context.
 * Pages: 'jaap' | 'about' | 'tapsetup' | 'progress' | 'privacy' | 'contact' | 'blog'
 * Language: 'english' | 'hindi' | 'gujarati'
 */
const NavContext = createContext({
  page: 'jaap',
  setPage: () => {},
  language: 'english',
  setLanguage: () => {},
});

export const LANGUAGES = ['english', 'hindi', 'gujarati'];

export const NavProvider = ({ children }) => {
  const [page, setPage] = useState('jaap');
  const [language, setLanguage] = useState('english');

  // Handle navkarsiddhi:// deeplinks fired from MainActivity (App Actions / Gemini).
  useEffect(() => {
    if (!isNativeShell()) return;
    const onDeeplink = (e) => {
      const target = e?.detail?.page;
      if (target) setPage(target);
    };
    document.addEventListener('navkar-deeplink', onDeeplink);
    return () => document.removeEventListener('navkar-deeplink', onDeeplink);
  }, []);

  return (
    <NavContext.Provider value={{ page, setPage, language, setLanguage }}>
      {children}
    </NavContext.Provider>
  );
};

export const useNav = () => useContext(NavContext);
