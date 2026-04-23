import React, { useState } from 'react';
import { completeProfile } from '../hooks/useAuth';

const s = {
  page: { minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  card: { background: 'var(--bg-secondary)', borderRadius: 12, padding: '36px 32px', width: 400, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' },
  progress: { display: 'flex', gap: 4, marginBottom: 24 },
  bar: (active) => ({ flex: 1, height: 3, borderRadius: 2, background: active ? 'var(--accent)' : 'var(--border)' }),
  step: { fontSize: 11, color: 'var(--text-secondary)', marginBottom: 6 },
  title: { fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 },
  label: { display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 },
  input: { width: '100%', boxSizing: 'border-box', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 6, padding: '9px 12px', color: 'var(--text-primary)', fontSize: 14, marginBottom: 14, outline: 'none' },
  textarea: { width: '100%', boxSizing: 'border-box', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 6, padding: '9px 12px', color: 'var(--text-primary)', fontSize: 14, marginBottom: 14, outline: 'none', resize: 'vertical', minHeight: 80 },
  chipWrap: { display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  chip: { background: 'var(--accent)', color: '#fff', borderRadius: 20, padding: '3px 10px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 },
  chipX: { background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 14, lineHeight: 1 },
  chipInput: { background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 6, padding: '7px 10px', color: 'var(--text-primary)', fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box', marginBottom: 14 },
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  btn: (primary) => ({ padding: '9px 20px', background: primary ? 'var(--accent)' : 'transparent', color: primary ? '#fff' : 'var(--text-secondary)', border: primary ? 'none' : '1px solid var(--border)', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }),
  skip: { background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer', textDecoration: 'underline' },
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
            <label style={s.label}>Bio</label>
            <textarea style={s.textarea} value={bio} onChange={e => setBio(e.target.value)} placeholder="A short bio..." />
            <label style={s.label}>Location</label>
            <input style={s.input} value={location} onChange={e => setLocation(e.target.value)} placeholder="City, Country" />
            <div style={s.nav}>
              <button style={s.skip} onClick={finish}>Skip setup</button>
              <button style={s.btn(true)} onClick={() => setStep(2)}>Next →</button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div style={s.title}>What are your skills?</div>
            <ChipInput chips={skills} setChips={setSkills} />
            <div style={s.nav}>
              <button style={s.btn(false)} onClick={() => setStep(1)}>← Back</button>
              <button style={s.btn(true)} onClick={() => setStep(3)}>Next →</button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div style={s.title}>What are your interests?</div>
            <ChipInput chips={interests} setChips={setInterests} />
            <div style={s.nav}>
              <button style={s.btn(false)} onClick={() => setStep(2)}>← Back</button>
              <button style={s.btn(true)} onClick={finish}>Finish</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
