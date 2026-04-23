import React, { useState } from 'react';
import api from '../api';

function initials(name) {
  return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';
}

const s = {
  panel: { width: 280, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-secondary)', boxSizing: 'border-box' },
  header: { padding: '16px 12px', fontWeight: 700, fontSize: 16, borderBottom: '1px solid var(--border)', color: 'var(--text-primary)' },
  searchWrap: { padding: '10px 12px' },
  input: { width: '100%', boxSizing: 'border-box', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 12px', color: 'var(--text-primary)', fontSize: 13, outline: 'none' },
  results: { flex: 1, overflowY: 'auto' },
  row: { display: 'flex', alignItems: 'center', padding: '8px 12px', gap: 10, borderBottom: '1px solid var(--border)' },
  avatar: { width: 36, height: 36, borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 12, flexShrink: 0 },
  name: { flex: 1, color: 'var(--text-primary)', fontSize: 14 },
  btnPrimary: { padding: '5px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer', background: 'var(--accent)', color: '#fff', border: 'none' },
  btnSecondary: { padding: '5px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer', background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)' },
  btnDisabled: { padding: '5px 10px', borderRadius: 6, fontSize: 12, cursor: 'default', background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)', opacity: 0.5 },
  empty: { padding: 20, color: 'var(--text-secondary)', fontSize: 13, textAlign: 'center' },
};

export default function SearchPanel({ onOpenThread }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [timer, setTimer] = useState(null);

  function search(q) {
    setQuery(q);
    clearTimeout(timer);
    if (!q.trim()) { setResults([]); return; }
    setTimer(setTimeout(async () => {
      try {
        const { data } = await api.get(`/users/search?q=${encodeURIComponent(q)}`);
        setResults(data);
      } catch { /* ignore */ }
    }, 300));
  }

  async function handleAdd(userId) {
    await api.post('/contacts/request', { recipient_id: userId });
    setResults(r => r.map(u => u._id === userId ? { ...u, connection_status: 'pending_sent' } : u));
  }

  async function handleAccept(userId) {
    const { data: requests } = await api.get('/contacts/requests');
    const req = requests.find(r => {
      const senderId = r.sender_id?._id || r.sender_id;
      return senderId?.toString() === userId.toString();
    });
    if (req) await api.patch(`/contacts/requests/${req._id}/accept`);
    setResults(r => r.map(u => u._id === userId ? { ...u, connection_status: 'connected' } : u));
  }

  function actionBtn(user) {
    if (user.connection_status === 'none') return <button style={s.btnPrimary} onClick={() => handleAdd(user._id)}>+ Add</button>;
    if (user.connection_status === 'pending_sent') return <button style={s.btnDisabled} disabled>Pending</button>;
    if (user.connection_status === 'pending_received') return <button style={s.btnSecondary} onClick={() => handleAccept(user._id)}>Accept</button>;
    if (user.connection_status === 'connected') return <button style={s.btnSecondary} onClick={() => onOpenThread(user)}>Message</button>;
    return null;
  }

  return (
    <div style={s.panel}>
      <div style={s.header}>Search</div>
      <div style={s.searchWrap}>
        <input style={s.input} value={query} onChange={e => search(e.target.value)} placeholder="Search people by name..." />
      </div>
      <div style={s.results}>
        {!query && <div style={s.empty}>Search for people by name</div>}
        {results.map(u => (
          <div key={u._id} style={s.row}>
            <div style={s.avatar}>
              {u.photo_url ? <img src={u.photo_url} alt="" style={{ width: 36, height: 36, borderRadius: '50%' }} /> : initials(u.name)}
            </div>
            <div style={s.name}>{u.name}</div>
            {actionBtn(u)}
          </div>
        ))}
      </div>
    </div>
  );
}
