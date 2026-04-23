import React, { useState } from 'react';
import api from '../api';

function teamInitial(name) { return name ? name[0].toUpperCase() : 'T'; }
function preview(content) { return content ? (content.length > 50 ? content.slice(0, 47) + '...' : content) : ''; }

const s = {
  panel: { width: 280, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-secondary)', boxSizing: 'border-box' },
  header: { padding: '16px 12px', fontWeight: 700, fontSize: 16, borderBottom: '1px solid var(--border)', color: 'var(--text-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  addBtn: { background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 13, cursor: 'pointer' },
  list: { flex: 1, overflowY: 'auto' },
  row: { display: 'flex', alignItems: 'center', padding: '10px 12px', gap: 10, cursor: 'pointer', borderBottom: '1px solid var(--border)' },
  avatar: { width: 40, height: 40, borderRadius: 8, background: '#6366f1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, flexShrink: 0 },
  teamName: { fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 },
  lastMsg: { color: 'var(--text-secondary)', fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  modal: { background: 'var(--bg-secondary)', borderRadius: 10, padding: 24, width: 340, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' },
  modalTitle: { fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 },
  input: { width: '100%', boxSizing: 'border-box', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 12px', color: 'var(--text-primary)', fontSize: 14, marginBottom: 12, outline: 'none' },
  contactList: { maxHeight: 180, overflowY: 'auto', marginBottom: 16 },
  contactRow: { display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', cursor: 'pointer' },
  checkbox: { width: 16, height: 16, cursor: 'pointer' },
  contactName: { color: 'var(--text-primary)', fontSize: 14 },
  modalBtns: { display: 'flex', justifyContent: 'flex-end', gap: 8 },
  cancelBtn: { padding: '8px 16px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer' },
  createBtn: (disabled) => ({ padding: '8px 16px', background: 'var(--accent)', border: 'none', borderRadius: 6, color: '#fff', fontSize: 13, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1 }),
};

export default function TeamsPanel({ threads, onSelect }) {
  const [showModal, setShowModal] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [contacts, setContacts] = useState([]);
  const [selected, setSelected] = useState([]);

  const groupThreads = (threads || []).filter(t => t.type === 'group');

  async function openModal() {
    const { data } = await api.get('/contacts');
    setContacts(data);
    setSelected([]);
    setTeamName('');
    setShowModal(true);
  }

  function toggleMember(id) {
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  }

  async function createTeam() {
    await api.post('/threads/group', { name: teamName, member_ids: selected });
    setShowModal(false);
  }

  const canCreate = teamName.trim().length > 0 && selected.length > 0;

  return (
    <div style={s.panel}>
      <div style={s.header}>
        Teams
        <button style={s.addBtn} onClick={openModal}>+ New</button>
      </div>
      <div style={s.list}>
        {groupThreads.map(t => (
          <div key={t._id} style={s.row} onClick={() => onSelect(t)}>
            <div style={s.avatar}>{teamInitial(t.name)}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={s.teamName}>{t.name}</div>
              <div style={s.lastMsg}>{preview(t.last_message?.content)}</div>
            </div>
          </div>
        ))}
        {groupThreads.length === 0 && (
          <div style={{ padding: 20, color: 'var(--text-secondary)', fontSize: 13, textAlign: 'center' }}>No teams yet. Create one!</div>
        )}
      </div>

      {showModal && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <div style={s.modalTitle}>Create a team</div>
            <input style={s.input} value={teamName} onChange={e => setTeamName(e.target.value)} placeholder="Team name" autoFocus />
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>Add members</div>
            <div style={s.contactList}>
              {contacts.map(c => (
                <label key={c._id} style={s.contactRow}>
                  <input style={s.checkbox} type="checkbox" checked={selected.includes(c._id)} onChange={() => toggleMember(c._id)} />
                  <span style={s.contactName}>{c.name}</span>
                </label>
              ))}
              {contacts.length === 0 && <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>No contacts yet — add some via Search first.</div>}
            </div>
            <div style={s.modalBtns}>
              <button style={s.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
              <button style={s.createBtn(!canCreate)} disabled={!canCreate} onClick={createTeam}>Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
