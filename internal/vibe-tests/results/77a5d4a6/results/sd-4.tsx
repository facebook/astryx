// Copyright (c) Meta Platforms, Inc. and affiliates.

import { useState } from 'react';

const termsText = `Terms and Conditions\n\n1. Acceptance of Terms\nBy accessing our service, you agree to these terms.\n\n2. Use of Service\nYou may use the service only for lawful purposes.\n\n3. Privacy\nGoverned by our Privacy Policy.\n\n4. Intellectual Property\nAll content is our property.\n\n5. Limitation of Liability\nWe are not liable for indirect damages.\n\n6. Governing Law\nGoverned by applicable law.\n\n7. Changes\nWe may modify terms at any time.`;

export default function TermsAcceptanceForm() {
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);

  return (
    <div style={{ maxWidth: 500, padding: 24, border: '1px solid #e0e0e0', borderRadius: 12 }}>
      <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 600 }}>Terms and Conditions</h3>
      <div style={{ maxHeight: 200, overflow: 'auto', border: '1px solid #ddd', borderRadius: 8, padding: 16, marginBottom: 16, fontSize: 14, whiteSpace: 'pre-wrap', color: '#444' }}>
        {termsText}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <input type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} />
          I agree to the Terms and Conditions
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <input type="checkbox" checked={agreePrivacy} onChange={(e) => setAgreePrivacy(e.target.checked)} />
          I agree to the Privacy Policy
        </label>
      </div>
      <button disabled={!agreeTerms || !agreePrivacy} style={{ width: '100%', padding: '10px 16px', background: (!agreeTerms || !agreePrivacy) ? '#ccc' : '#0066cc', color: 'white', border: 'none', borderRadius: 6, cursor: (!agreeTerms || !agreePrivacy) ? 'not-allowed' : 'pointer', fontWeight: 500 }}>
        Accept and Continue
      </button>
    </div>
  );
}
