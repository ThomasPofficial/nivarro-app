import React, { useState } from 'react';
import { completeProfile } from '../hooks/useAuth';

const input = {
  width: '100%', boxSizing: 'border-box',
  background: 'var(--bg-mid)', border: '1px solid var(--border)',
  borderRadius: 8, padding: '11px 14px',
  color: 'var(--text-primary)', fontSize: 14, fontWeight: 500,
  marginBottom: 14, outline: 'none',
  fontFamily: "'Plus Jakarta Sans', sans-serif",
};

const s = {
  page: {
    minHeight: '100vh', background: 'var(--bg-primary)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  card: {
    background: 'var(--bg-secondary)', borderRadius: 14,
    padding: '40px 36px', width: 420,
    boxShadow: '0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px var(--border)',
  },
  progress: { display: 'flex', gap: 4, marginBottom: 24 },
  bar: (active) => ({ flex: 1, height: 3, borderRadius: 2, background: active ? 'var(--accent)' : 'var(--border)' }),
  step: { fontSize: 11, fontWeight: 600, letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase' },
  title: { fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 500, color: '#f0f8ff', marginBottom: 22 },
  label: { display: 'block', fontSize: 12, fontWeight: 600, letterSpacing: '0.3px', color: 'var(--text-secondary)', marginBottom: 5 },
  input,
  textarea: { ...input, resize: 'vertical', minHeight: 90 },
  chipWrap: { display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  chip: {
    background: 'var(--bg-active)', color: 'var(--accent-hi)',
    border: '1px solid rgba(40,120,240,0.3)',
    borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 600,
    display: 'flex', alignItems: 'center', gap: 6,
  },
  chipX: { background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 15, lineHeight: 1 },
  chipInput: { ...input, marginBottom: 14 },
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  btnPrimary: {
    padding: '10px 24px',
    background: 'linear-gradient(135deg, #0a3ea0, #1060d8)',
    color: '#fff', border: 'none', borderRadius: 10,
    fontSize: 13, fontWeight: 700, cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(16,96,216,0.4)',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  btnSecondary: {
    padding: '10px 20px', background: 'transparent',
    color: 'var(--text-secondary)', border: '1px solid var(--border)',
    borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  skip: {
    background: 'none', border: 'none', color: 'var(--text-muted)',
    fontSize: 13, fontWeight: 500, cursor: 'pointer', textDecoration: 'underline',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
};

function ChipInput({ chips, setChips }) {
  const [val, setVal] = useState('');
  function add() {
    const trimmed = val.trim();
    if (trimmed && !chips.includes(trimmed)) setChips([...chips, trimmed]);
    setVal('');
  }
  return (
    <>
      <div style={s.chipWrap}>
        {chips.map(c => (
          <span key={c} style={s.chip}>
            {c}
            <button style={s.chipX} onClick={() => setChips(chips.filter(x => x !== c))}>×</button>
          </span>
        ))}
      </div>
      <input
        style={s.chipInput}
        value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); } }}
        placeholder="Type and press Enter to add"
      />
    </>
  );
}

export default function ProfileSetupPage({ onComplete }) {
  const [step, setStep] = useState(1);
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState([]);
  const [interests, setInterests] = useState([]);

  async function finish() {
    await completeProfile({ bio, location, skills, interests });
    onComplete();
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.progress}>
          {[1, 2, 3].map(n => <div key={n} style={s.bar(step >= n)} />)}
        </div>
        <div style={s.step}>Step {step} of 3</div>

        {step === 1 && (
          <>
            <div style={s.title}>Tell us about yourself</div>
            <label style={s.label}>BIO</label>
            <textarea style={s.textarea} value={bio} onChange={e => setBio(e.target.value)} placeholder="A short bio..." />
            <label style={s.label}>LOCATION</label>
            <input style={s.input} value={location} onChange={e => setLocation(e.target.value)} placeholder="City, Country" />
            <div style={s.nav}>
              <button style={s.skip} onClick={finish}>Skip setup</button>
              <button style={s.btnPrimary} onClick={() => setStep(2)}>Next →</button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div style={s.title}>What are your skills?</div>
            <ChipInput chips={skills} setChips={setSkills} />
            <div style={s.nav}>
              <button style={s.btnSecondary} onClick={() => setStep(1)}>← Back</button>
              <button style={s.btnPrimary} onClick={() => setStep(3)}>Next →</button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div style={s.title}>What are your interests?</div>
            <ChipInput chips={interests} setChips={setInterests} />
            <div style={s.nav}>
              <button style={s.btnSecondary} onClick={() => setStep(2)}>← Back</button>
              <button style={s.btnPrimary} onClick={finish}>Finish</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
