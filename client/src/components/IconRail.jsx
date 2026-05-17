import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { logout, getStoredUser } from '../hooks/useAuth';

function initials(name) {
  return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';
}

const NAV = [
  {
    id: 'messages',
    title: 'Messages',
    svg: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>,
  },
  {
    id: 'search',
    title: 'Search',
    svg: <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
  },
  {
    id: 'teams',
    title: 'Teams',
    svg: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
  },
];

export default function IconRail({ active, onSelect }) {
  const { theme, toggleTheme } = useTheme();
  const user = getStoredUser();
  const isDark = theme === 'dark';

  return (
    <div style={{
      width: 52, flexShrink: 0, background: 'var(--bg-rail)',
      borderRight: '1px solid rgba(20,36,54,0.8)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '14px 0', height: '100vh', boxSizing: 'border-box',
    }}>
      {/* Crown logo */}
      <div style={{ marginBottom: 28 }}>
        <svg viewBox="0 0 130 95" fill="none" style={{ width: 34, height: 26 }}>
          <polygon points="4,38 42,20 52,44 20,56" fill="white" opacity="0.92"/>
          <polygon points="12,39 40,24 49,43 22,52" fill="#04080f"/>
          <polygon points="12,39 40,24 49,43 22,52" fill="none" stroke="white" strokeWidth="1" opacity="0.45"/>
          <polygon points="126,38 88,20 78,44 110,56" fill="white" opacity="0.92"/>
          <polygon points="118,39 90,24 81,43 108,52" fill="#04080f"/>
          <polygon points="118,39 90,24 81,43 108,52" fill="none" stroke="white" strokeWidth="1" opacity="0.45"/>
          <polygon points="65,2 79,46 65,62 51,46" fill="white" opacity="0.97"/>
          <polygon points="65,11 76,45 65,56 54,45" fill="#04080f"/>
          <polygon points="65,11 76,45 65,56 54,45" fill="none" stroke="white" strokeWidth="1" opacity="0.5"/>
        </svg>
      </div>

      {/* Nav icons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
        {NAV.map(({ id, title, svg }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              title={title}
              onClick={() => onSelect(id)}
              style={{
                width: 40, height: 40, borderRadius: 10, border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isActive ? 'var(--bg-active)' : 'transparent',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--bg-hover)'; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke={isActive ? 'var(--accent-hi)' : '#3a5878'}
                strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round">
                {svg}
              </svg>
            </button>
          );
        })}
      </div>

      {/* Bottom controls */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          style={{
            width: 36, height: 36, borderRadius: 10, border: 'none', cursor: 'pointer',
            background: 'var(--bg-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {isDark ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#5a7898" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#5a7898" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          )}
        </button>

        {/* Avatar */}
        <div
          title={`${user?.name} — click to sign out`}
          onClick={logout}
          style={{
            width: 32, height: 32, borderRadius: '50%', cursor: 'pointer',
            background: 'linear-gradient(140deg,#b07808,#d8a820)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 800, color: '#fff',
            boxShadow: '0 0 0 2px var(--bg-rail), 0 0 0 3.5px rgba(200,140,20,0.35)',
          }}
        >
          {initials(user?.name || '')}
        </div>
      </div>
    </div>
  );
}
