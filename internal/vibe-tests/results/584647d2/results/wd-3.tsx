// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';

type Step = 'welcome' | 'profile' | 'preferences' | 'done';

export default function OnboardingFlow() {
  const [step, setStep] = useState<Step>('welcome');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const cardStyle = {width: 480, margin: '40px auto', padding: 32, border: '1px solid #e0e0e0', borderRadius: 12, backgroundColor: '#fff'};
  const btnPrimary = {padding: '10px 20px', backgroundColor: '#0066cc', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer'};
  const btnGhost = {padding: '10px 20px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: '#666'};
  const inputStyle = {width: '100%', padding: '8px 12px', border: '1px solid #ccc', borderRadius: 6, fontSize: 14};

  return (
    <div style={cardStyle}>
      {step === 'welcome' && (
        <div>
          <h2>Welcome!</h2>
          <p>Let us get you set up in just a few steps.</p>
          <button style={btnPrimary} onClick={() => setStep('profile')}>Get Started</button>
        </div>
      )}
      {step === 'profile' && (
        <div>
          <h2>Profile Setup</h2>
          <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
            <label>Name<input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} /></label>
            <label>Email<input style={inputStyle} type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
          </div>
          <div style={{display: 'flex', gap: 8, marginTop: 16}}>
            <button style={btnGhost} onClick={() => setStep('welcome')}>Back</button>
            <button style={btnPrimary} onClick={() => setStep('preferences')}>Next</button>
          </div>
        </div>
      )}
      {step === 'preferences' && (
        <div>
          <h2>Preferences</h2>
          <p>Choose your notification preferences and display settings.</p>
          <div style={{display: 'flex', gap: 8, marginTop: 16}}>
            <button style={btnGhost} onClick={() => setStep('profile')}>Back</button>
            <button style={btnPrimary} onClick={() => setStep('done')}>Finish</button>
          </div>
        </div>
      )}
      {step === 'done' && (
        <div>
          <h2>All Done!</h2>
          <p>Your account is ready. Start exploring.</p>
          <button style={btnPrimary}>Go to Dashboard</button>
        </div>
      )}
    </div>
  );
}
