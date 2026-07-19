// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';

export default function TermsForm() {
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);

  return (
    <div style={{border: '1px solid #e5e7eb', borderRadius: 8, padding: 24, maxWidth: 500}}>
      <h2 style={{marginBottom: 16, fontSize: 20, fontWeight: 600}}>Terms and Conditions</h2>
      <div style={{height: 200, overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: 6, padding: 16, marginBottom: 16, fontSize: 14, lineHeight: 1.6}}>
        <p><strong>1. Acceptance of Terms</strong></p>
        <p>By accessing this service you agree to be bound by these terms.</p>
        <p><strong>2. Use of Service</strong></p>
        <p>You may use this service only for lawful purposes.</p>
        <p><strong>3. Privacy</strong></p>
        <p>Your use of the service is subject to our Privacy Policy.</p>
        <p><strong>4. Termination</strong></p>
        <p>We may terminate your access at any time for violation of these terms.</p>
        <p><strong>5. Limitation of Liability</strong></p>
        <p>The service is provided as-is without warranties of any kind.</p>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16}}>
        <label style={{display: 'flex', alignItems: 'center', gap: 8}}><input type="checkbox" checked={agreeTerms} onChange={e => setAgreeTerms(e.target.checked)} /> I agree to the Terms and Conditions</label>
        <label style={{display: 'flex', alignItems: 'center', gap: 8}}><input type="checkbox" checked={agreePrivacy} onChange={e => setAgreePrivacy(e.target.checked)} /> I agree to the Privacy Policy</label>
      </div>
      <div style={{display: 'flex', gap: 8, justifyContent: 'flex-end'}}>
        <button style={{padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: 4, background: 'white', cursor: 'pointer'}}>Decline</button>
        <button disabled={!agreeTerms || !agreePrivacy} style={{padding: '8px 16px', border: 'none', borderRadius: 4, background: (!agreeTerms || !agreePrivacy) ? '#93c5fd' : '#2563eb', color: 'white', cursor: 'pointer'}}>Accept</button>
      </div>
    </div>
  );
}
