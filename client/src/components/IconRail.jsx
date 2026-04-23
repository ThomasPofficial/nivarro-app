import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { logout, getStoredUser } from '../hooks/useAuth';

function initials(name) {
  return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';
}

const iconBtn = (active) => ({
  width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: active ? 'var(--accent)' : 'transparent', cursor: 'pointer', border: 'none',
  color: active ? '#fff' : 'var(--text-secondary)', fontSize: 18, margin: '4px auto',
});

export default function IconRail({ active, onSelect }) {
  const { theme, toggleTheme } = useTheme();
  const user = getStoredUser();

  return (
    <div style={{ width: 44, background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 0', height: '100vh', boxSizing: 'border-box', flexShrink: 0 }}>
      <div style={{ width: 28, height: 28, background: 'var(--accent)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14, marginBottom: 16 }}>N</div>

      <button style={iconBtn(active === 'messages')} title="Messages" onClick={() => onSelect('messages')}>💬</button>
      <button style={iconBtn(active === 'search')} title="Search" onClick={() => onSelect('search')}>🔍</button>
      <button style={iconBtn(active === 'teams')} title="Teams" onClick={() => onSelect('teams')}>👥</button>

      <div style={{ flex: 1 }} />

      <button style={{ ...iconBtn(false), fontSize: 15 }} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} onClick={toggleTheme}>
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
      <div
        title={`${user?.name} — click to sign out`}
        onClick={logout}
        style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, cursor: 'pointer', marginTop: 8 }}
      >
        {initials(user?.name || '')}
      </div>
    </div>
  );
}
