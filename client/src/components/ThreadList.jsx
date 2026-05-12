import React from 'react';
import { useThread } from '../hooks/useThread';

function initials(name) {
  return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';
}

function preview(content) {
  if (!content) return '';
  return content.length > 60 ? content.slice(0, 57) + '...' : content;
}

export default function ThreadList({ token, userId, onSelect, onCompose }) {
  const threads = useThread(token);
  const dmThreads = threads.filter(t => !t.type || t.type === 'dm');

  return (
    <div style={{ width: 280, borderRight: '1px solid var(--border)', overflowY: 'auto', height: '100vh', background: 'var(--bg-secondary)' }}>
      <div style={{ padding: '16px 12px', fontWeight: 700, fontSize: 16, borderBottom: '1px solid var(--border)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>Messages</span>
        <button
          onClick={onCompose}
          title="New message"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', padding: 4, display: 'flex', alignItems: 'center', borderRadius: 6 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
        </button>
      </div>
      {dmThreads.length === 0 && (
        <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>
          <div style={{ marginBottom: 12 }}>No conversations yet.</div>
          <button
            onClick={onCompose}
            style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 13, cursor: 'pointer' }}
          >
            Find people to message
          </button>
        </div>
      )}
      {dmThreads.map(thread => {
        const participant = thread.participants?.find(p => p._id?.toString() !== userId) || thread.participant;
        return (
          <div
            key={thread._id}
            onClick={() => onSelect(thread)}
            style={{ display: 'flex', alignItems: 'center', padding: '10px 12px', cursor: 'pointer', borderBottom: '1px solid var(--border)' }}
          >
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, flexShrink: 0 }}>
              {participant?.photo_url
                ? <img src={participant.photo_url} alt="" style={{ width: 40, height: 40, borderRadius: '50%' }} />
                : initials(participant?.name || '')}
            </div>
            <div style={{ marginLeft: 10, flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{participant?.name || 'Unknown'}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {preview(thread.last_message?.content)}
              </div>
            </div>
            {thread.unread_count > 0 && (
              <div style={{ background: 'var(--accent)', color: '#fff', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                {thread.unread_count}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
