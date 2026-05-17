import React, { createContext, useContext, useEffect, useState } from 'react';

const DARK = {
  '--bg-primary':    '#030609',
  '--bg-secondary':  '#060d1a',
  '--bg-rail':       '#04080f',
  '--bg-mid':        '#0c1a2e',
  '--bg-hover':      '#0e1e36',
  '--bg-active':     '#102644',
  '--text-primary':  '#e4eeff',
  '--text-secondary':'#8ab0d8',
  '--text-muted':    '#5a7898',
  '--text-faint':    '#3a5470',
  '--accent':        '#1060d8',
  '--accent-hi':     '#2878f0',
  '--accent-deep':   '#0a3ea0',
  '--accent-glow':   'rgba(16,96,216,0.5)',
  '--border':        '#142436',
};

const LIGHT = {
  '--bg-primary':    '#f0f4fa',
  '--bg-secondary':  '#ffffff',
  '--bg-rail':       '#081830',
  '--bg-mid':        '#eef3fa',
  '--bg-hover':      '#e4ecf6',
  '--bg-active':     '#d8e8f8',
  '--text-primary':  '#0a1628',
  '--text-secondary':'#2a4060',
  '--text-muted':    '#4a6080',
  '--text-faint':    '#7a98b8',
  '--accent':        '#1060d8',
  '--accent-hi':     '#2878f0',
  '--accent-deep':   '#0a3ea0',
  '--accent-glow':   'rgba(16,96,216,0.35)',
  '--border':        '#c8d8ec',
};

function applyTheme(theme) {
  const vars = theme === 'light' ? LIGHT : DARK;
  Object.entries(vars).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));
}

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => { applyTheme(theme); }, [theme]);

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', next);
    setThemeState(next);
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
