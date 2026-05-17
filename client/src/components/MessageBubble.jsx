import React from 'react';

export default function MessageBubble({ message, isMine }) {
  const time = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: isMine ? 'flex-end' : 'flex-start',
      marginBottom: 10,
      gap: 3,
    }}>
      <div style={{
        maxWidth: '65%',
        padding: '11px 15px',
        fontSize: 14,
        fontWeight: 500,
        lineHeight: 1.55,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        wordBreak: 'break-word',
        ...(isMine ? {
          background: 'linear-gradient(135deg, #0a3ea0, #1060d8)',
          color: '#ffffff',
          borderRadius: '13px 13px 3px 13px',
          boxShadow: '0 4px 20px rgba(16,96,216,0.5)',
        } : {
          background: '#0e2448',
          color: '#d8eeff',
          borderRadius: '13px 13px 13px 3px',
          border: '1px solid #1e3a68',
        }),
      }}>
        {message.content}
      </div>
      <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', padding: '0 2px' }}>
        {time}
      </span>
    </div>
  );
}
