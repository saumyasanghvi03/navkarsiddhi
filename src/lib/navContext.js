"use client";

import React, { createContext, useContext, useState } from 'react';

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

  return (
    <NavContext.Provider value={{ page, setPage, language, setLanguage }}>
      {children}
    </NavContext.Provider>
  );
};

export const useNav = () => useContext(NavContext);
