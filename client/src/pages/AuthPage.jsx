import React, { useState } from 'react';
import { login, register } from '../hooks/useAuth';

const s = {
  page: {
    minHeight: '100vh', background: 'var(--bg-primary)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  card: {
    background: 'var(--bg-secondary)', borderRadius: 14,
    padding: '40px 36px', width: 380,
    boxShadow: '0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px var(--border)',
  },
  logo: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 32, fontWeight: 500, letterSpacing: '-0.5px',
    color: '#f0f8ff', marginBottom: 4, textAlign: 'center',
  },
  sub: { fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', textAlign: 'center', marginBottom: 30 },
  label: { display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5, letterSpacing: '0.3px' },
  input: {
    width: '100%', boxSizing: 'border-box',
    background: 'var(--bg-mid)', border: '1px solid var(--border)',
    borderRadius: 8, padding: '11px 14px',
    color: 'var(--text-primary)', fontSize: 14, fontWeight: 500,
    marginBottom: 14, outline: 'none',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  btn: {
    width: '100%', padding: '12px',
    background: 'linear-gradient(135deg, #0a3ea0, #1060d8)',
    color: '#fff', border: 'none', borderRadius: 10,
    fontSize: 14, fontWeight: 700, cursor: 'pointer', marginTop: 6,
    boxShadow: '0 4px 20px rgba(16,96,216,0.45)',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  toggle: { textAlign: 'center', marginTop: 18, fontSize: 13, fontWeight: 500, color: 'var(--text-muted)' },
  toggleLink: {
    color: 'var(--accent-hi)', cursor: 'pointer',
    background: 'none', border: 'none', fontSize: 13, fontWeight: 600,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  error: { color: '#f87171', fontSize: 13, fontWeight: 500, marginBottom: 12 },
  pwWrap: { position: 'relative', marginBottom: 14 },
  pwInput: {
    width: '100%', boxSizing: 'border-box',
    background: 'var(--bg-mid)', border: '1px solid var(--border)',
    borderRadius: 8, padding: '11px 44px 11px 14px',
    color: 'var(--text-primary)', fontSize: 14, fontWeight: 500,
    outline: 'none', fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  showBtn: {
    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', color: 'var(--text-muted)',
    cursor: 'pointer', fontSize: 12, fontWeight: 600,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
};

function PasswordInput({ value, onChange, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <div style={s.pwWrap}>
      <input style={s.pwInput} type={show ? 'text' : 'password'} value={value} onChange={onChange} placeholder={placeholder} />
      <button style={s.showBtn} type="button" onClick={() => setShow(v => !v)}>{show ? 'Hide' : 'Show'}</button>
    </div>
  );
}

export default function AuthPage({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (mode === 'register' && password !== confirm) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      const user = mode === 'login'
        ? await login(email, password)
        : await register(name, email, password);
      onAuth(user);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>Nivarro</div>
        <div style={s.sub}>{mode === 'login' ? 'Welcome back' : 'Create your account'}</div>
        {error && <div style={s.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <>
              <label style={s.label}>NAME</label>
              <input style={s.input} type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required />
            </>
          )}
          <label style={s.label}>EMAIL</label>
          <input style={s.input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required />
          <label style={s.label}>PASSWORD</label>
          <PasswordInput value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
          {mode === 'register' && (
            <>
              <label style={s.label}>CONFIRM PASSWORD</label>
              <PasswordInput value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Confirm password" />
            </>
          )}
          <button style={s.btn} type="submit" disabled={loading}>
            {loading ? '...' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>
        <div style={s.toggle}>
          {mode === 'login' ? (
            <>No account? <button style={s.toggleLink} onClick={() => { setMode('register'); setError(''); }}>Create one</button></>
          ) : (
            <>Have an account? <button style={s.toggleLink} onClick={() => { setMode('login'); setError(''); }}>Sign in</button></>
          )}
        </div>
      </div>
    </div>
  );
}
