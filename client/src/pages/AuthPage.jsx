import React, { useState } from 'react';
import { login, register } from '../hooks/useAuth';

const s = {
  page: { minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  card: { background: 'var(--bg-secondary)', borderRadius: 12, padding: '36px 32px', width: 360, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' },
  logo: { fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4, textAlign: 'center' },
  sub: { fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 28 },
  label: { display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 },
  input: { width: '100%', boxSizing: 'border-box', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 6, padding: '9px 12px', color: 'var(--text-primary)', fontSize: 14, marginBottom: 14, outline: 'none' },
  btn: { width: '100%', padding: '10px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: 'pointer', marginTop: 4 },
  toggle: { textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--text-secondary)' },
  toggleLink: { color: 'var(--accent)', cursor: 'pointer', background: 'none', border: 'none', fontSize: 13 },
  error: { color: '#f87171', fontSize: 13, marginBottom: 12 },
  pwWrap: { position: 'relative', marginBottom: 14 },
  pwInput: { width: '100%', boxSizing: 'border-box', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 6, padding: '9px 40px 9px 12px', color: 'var(--text-primary)', fontSize: 14, outline: 'none' },
  showBtn: { position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 12 },
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
              <label style={s.label}>Name</label>
              <input style={s.input} type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required />
            </>
          )}
          <label style={s.label}>Email</label>
          <input style={s.input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required />
          <label style={s.label}>Password</label>
          <PasswordInput value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
          {mode === 'register' && (
            <>
              <label style={s.label}>Confirm password</label>
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
