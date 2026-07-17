// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';

const termsText = `These Terms of Service govern your use of our platform. By accessing or using the service, you agree to be bound by these terms.

1. Account Registration: You must provide accurate information.
2. Acceptable Use: You agree not to misuse the service.
3. Privacy: Your use is subject to our Privacy Policy.
4. Termination: We may suspend access at any time.
5. Limitation of Liability: Provided "as is" without warranties.`;

export default function TermsAcceptance() {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  return (
    <div style={{maxWidth: 560, margin: '0 auto', padding: 24}}>
      <h2 style={{fontSize: 24, fontWeight: 700, marginBottom: 8}}>Terms and Conditions</h2>
      <p style={{fontSize: 14, color: '#64748b', marginBottom: 16}}>Please read and accept the following to continue.</p>

      <div style={{maxHeight: 200, overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: 8, padding: 16, marginBottom: 16}}>
        <p style={{fontSize: 14, whiteSpace: 'pre-wrap', margin: 0}}>{termsText}</p>
      </div>

      <div style={{display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24}}>
        <label style={{display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer'}}>
          <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} />
          I agree to the Terms of Service
        </label>
        <label style={{display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer'}}>
          <input type="checkbox" checked={privacyAccepted} onChange={(e) => setPrivacyAccepted(e.target.checked)} />
          I agree to the Privacy Policy
        </label>
      </div>

      <button disabled={!termsAccepted || !privacyAccepted} style={{padding: '10px 24px', background: termsAccepted && privacyAccepted ? '#4f46e5' : '#94a3b8', color: '#fff', border: 'none', borderRadius: 8, cursor: termsAccepted && privacyAccepted ? 'pointer' : 'not-allowed'}}>
        Continue
      </button>
    </div>
  );
}
