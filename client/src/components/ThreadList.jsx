import React, { useState } from 'react';
import { useThread } from '../hooks/useThread';

function initials(name) {
  return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';
}

function preview(content) {
  if (!content) return '';
  return content.length > 50 ? content.slice(0, 47) + '...' : content;
}

const AVATAR_COLORS = [
  'linear-gradient(135deg,#1a3a6a,#0e2248)',
  'linear-gradient(135deg,#1c2a1a,#0e2010)',
  'linear-gradient(135deg,#2a1a1a,#201010)',
  'linear-gradient(135deg,#1a2a2a,#0e2020)',
  'linear-gradient(135deg,#241a2a,#180e20)',
  'linear-gradient(135deg,#1a1a2a,#0e0e20)',
];

function avatarColor(name) {
  let h = 0;
  for (let i = 0; i < (name || '').length; i++) h = (h + name.charCodeAt(i)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[h];
}

export default function ThreadList({ token, userId, onSelect, selectedThreadId, onCompose }) {
  const threads = useThread(token);
  const [search, setSearch] = useState('');
  const dmThreads = threads.filter(t => !t.type || t.type === 'dm');
  const filtered = search
    ? dmThreads.filter(t => {
        const p = t.participants?.find(p => p._id?.toString() !== userId) || t.participant;
        return (p?.name || '').toLowerCase().includes(search.toLowerCase());
      })
    : dmThreads;

  return (
    <div style={{
      width: 280, flexShrink: 0, background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', height: '100vh',
    }}>
      {/* Header */}
      <div style={{ padding: '16px 14px 12px', borderBottom: '1px solid var(--border)' }}>
        <div style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 24, fontWeight: 500, letterSpacing: '-0.3px',
          color: '#f0f8ff', marginBottom: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span>Messages</span>
          <button
            onClick={onCompose}
            title="New message"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6, display: 'flex' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-hi)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
          </button>
        </div>

        {/* Search bar — icon never overlaps text */}
        <div style={{
          display: 'flex', alignItems: 'center',
          background: 'var(--bg-mid)', border: '1px solid var(--border)',
          borderRadius: 10, overflow: 'hidden',
        }}>
          <div style={{ width: 36, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search"
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              padding: '9px 10px 9px 0', fontSize: 13, fontWeight: 500,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: 'var(--text-primary)',
            }}
          />
        </div>
      </div>

      {/* Thread list */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {filtered.length === 0 && (
          <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
            <div style={{ marginBottom: 12 }}>No conversations yet.</div>
            <button
              onClick={onCompose}
              style={{
                background: 'var(--accent)', color: '#fff', border: 'none',
                borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Find people to message
            </button>
          </div>
        )}

        {filtered.map(thread => {
          const participant = thread.participants?.find(p => p._id?.toString() !== userId) || thread.participant;
          const isActive = thread._id === selectedThreadId;
          return (
            <div
              key={thread._id}
              onClick={() => onSelect(thread)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: isActive ? '10px 14px 10px 11.5px' : '10px 14px',
                cursor: 'pointer',
                background: isActive ? 'var(--bg-active)' : 'transparent',
                borderLeft: isActive ? '2.5px solid var(--accent)' : '2.5px solid transparent',
                transition: 'background 0.12s',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--bg-hover)'; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
            >
              {/* Avatar */}
              <div style={{
                width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                background: participant?.photo_url ? 'transparent' : avatarColor(participant?.name),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 800, color: 'rgba(200,228,255,0.95)',
                overflow: 'hidden',
              }}>
                {participant?.photo_url
                  ? <img src={participant.photo_url} alt="" style={{ width: 34, height: 34, borderRadius: '50%' }} />
                  : initials(participant?.name || '')}
              </div>

              {/* Text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 4, marginBottom: 3 }}>
                  <span style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 17, fontWeight: 600, letterSpacing: '0.1px',
                    color: isActive ? '#f0f8ff' : '#deeeff',
                    lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {participant?.name || 'Unknown'}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {thread.last_message?.timestamp
                      ? new Date(thread.last_message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : ''}
                  </span>
                </div>
                <div style={{
                  fontSize: 12, fontWeight: 500, color: isActive ? 'var(--text-muted)' : 'var(--text-secondary)',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {preview(thread.last_message?.content)}
                </div>
              </div>

              {/* Unread badge */}
              {thread.unread_count > 0 && (
                <div style={{
                  background: 'var(--accent)', color: '#fff', borderRadius: '50%',
                  width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700, flexShrink: 0,
                }}>
                  {thread.unread_count}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
