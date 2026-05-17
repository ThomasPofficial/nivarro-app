import React, { useRef, useEffect } from 'react';
import { useMessages } from '../hooks/useMessages';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

function initials(name) {
  return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';
}

export default function ChatWindow({ thread, userId }) {
  const { messages, hasMore, sendMessage, loadMore, handleTyping } = useMessages(thread._id, userId);
  const [input, setInput] = React.useState('');
  const bottomRef = useRef(null);
  const participant = thread.participants?.find(p => p._id?.toString() !== userId) || thread.participant;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput('');
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-primary)' }}>

      {/* Header */}
      <div style={{
        height: 56, flexShrink: 0, display: 'flex', alignItems: 'center',
        padding: '0 20px', gap: 12, borderBottom: '1px solid var(--border)',
      }}>
        <div style={{
          width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg,#1a3a6a,#0e2248)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 800, color: '#a8d0f0', overflow: 'hidden',
        }}>
          {participant?.photo_url
            ? <img src={participant.photo_url} alt="" style={{ width: 38, height: 38, borderRadius: '50%' }} />
            : initials(participant?.name || '')}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 23, fontWeight: 500, letterSpacing: '-0.3px', color: '#f0f8ff', lineHeight: 1.1,
          }}>
            {participant?.name || 'Chat'}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
        {hasMore && (
          <button
            onClick={loadMore}
            style={{
              display: 'block', margin: '0 auto 16px',
              background: 'var(--bg-mid)', border: '1px solid var(--border)',
              color: 'var(--text-secondary)', borderRadius: 8,
              padding: '6px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}
          >
            Load older messages
          </button>
        )}
        {messages.map(msg => (
          <MessageBubble
            key={msg._id}
            message={msg}
            isMine={msg.sender_id?.toString() === userId?.toString()}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      <TypingIndicator threadId={thread._id} currentUserId={userId} />

      {/* Input */}
      <form onSubmit={handleSubmit} style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--bg-mid)', border: '1px solid var(--border)',
          borderRadius: 10, padding: '0 4px 0 14px',
        }}>
          <input
            value={input}
            onChange={e => { setInput(e.target.value); handleTyping(); }}
            placeholder={`Message ${participant?.name || ''}...`}
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              padding: '13px 0', fontSize: 14, fontWeight: 500,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: 'var(--text-primary)',
            }}
          />
          <button
            type="submit"
            style={{
              width: 36, height: 36, flexShrink: 0, borderRadius: 8, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #0a3ea0, #1060d8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(16,96,216,0.5)',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}
