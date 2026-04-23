import React, { createContext, useContext, useEffect, useState } from 'react';

const DARK = {
  '--bg-primary': '#0f172a',
  '--bg-secondary': '#1e293b',
  '--text-primary': '#ffffff',
  '--text-secondary': '#94a3b8',
  '--accent': '#0ea5e9',
  '--border': '#334155',
};

const LIGHT = {
  '--bg-primary': '#f8fafc',
  '--bg-secondary': '#ffffff',
  '--text-primary': '#0f172a',
  '--text-secondary': '#64748b',
  '--accent': '#0ea5e9',
  '--border': '#e2e8f0',
};

function applyTheme(theme) {
  const vars = theme === 'light' ? LIGHT : DARK;
  Object.entries(vars).forEach(([k, v]) => document.body.style.setProperty(k, v));
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
