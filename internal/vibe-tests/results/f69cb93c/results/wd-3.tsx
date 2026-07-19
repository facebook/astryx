// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';

export default function OnboardingFlow() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const cardStyle = {border: '1px solid #e5e7eb', borderRadius: 8, padding: 24, maxWidth: 480, margin: '0 auto'};
  const btnPrimary = {padding: '10px 20px', border: 'none', borderRadius: 6, background: '#2563eb', color: 'white', cursor: 'pointer', fontSize: 14};
  const btnSecondary = {padding: '10px 20px', border: '1px solid #d1d5db', borderRadius: 6, background: 'white', cursor: 'pointer', fontSize: 14};
  const inputStyle = {width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14};

  return (
    <div style={cardStyle}>
      {step === 0 && (
        <div>
          <h2 style={{marginBottom: 8}}>Welcome</h2>
          <p style={{color: '#6b7280', marginBottom: 16}}>Thanks for joining. Let us get you set up in a few steps.</p>
          <button style={btnPrimary} onClick={() => setStep(1)}>Get Started</button>
        </div>
      )}
      {step === 1 && (
        <div>
          <h2 style={{marginBottom: 16}}>Profile Setup</h2>
          <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
            <div><label style={{display: 'block', marginBottom: 4, fontWeight: 500}}>Name</label><input style={inputStyle} value={name} onChange={e => setName(e.target.value)} /></div>
            <div><label style={{display: 'block', marginBottom: 4, fontWeight: 500}}>Email</label><input style={inputStyle} type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
            <div style={{display: 'flex', gap: 8}}><button style={btnSecondary} onClick={() => setStep(0)}>Back</button><button style={btnPrimary} onClick={() => setStep(2)}>Next</button></div>
          </div>
        </div>
      )}
      {step === 2 && (
        <div>
          <h2 style={{marginBottom: 16}}>Preferences</h2>
          <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
            <label style={{display: 'flex', alignItems: 'center', gap: 8}}><input type="checkbox" /> Enable dark mode</label>
            <label style={{display: 'flex', alignItems: 'center', gap: 8}}><input type="checkbox" defaultChecked /> Email notifications</label>
            <div style={{display: 'flex', gap: 8}}><button style={btnSecondary} onClick={() => setStep(1)}>Back</button><button style={btnPrimary} onClick={() => setStep(3)}>Next</button></div>
          </div>
        </div>
      )}
      {step === 3 && (
        <div>
          <h2 style={{marginBottom: 8}}>All Done</h2>
          <p style={{color: '#6b7280', marginBottom: 16}}>Your account is set up and ready to use.</p>
          <button style={btnPrimary}>Go to Dashboard</button>
        </div>
      )}
    </div>
  );
}
