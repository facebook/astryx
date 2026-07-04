import {useState, useRef, useEffect} from 'react';

const TERMS = `Terms and Conditions\n\n1. Acceptance...\n2. Use License...\n3. Disclaimer...\n4. Limitations...\n5. Accuracy...\n6. Links...\n7. Modifications...\n8. Governing Law...\n\nPlease read carefully.\nBy accepting you agree to all terms.\nThis is a binding agreement.\nThank you.`;

export default function TermsAcceptanceForm() {
  const [scrolled, setScrolled] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const h = () => { if (el.scrollHeight - el.scrollTop <= el.clientHeight + 20) setScrolled(true); };
    el.addEventListener('scroll', h);
    return () => el.removeEventListener('scroll', h);
  }, []);

  if (submitted) return <div style={{padding: 24}}><h2 style={{fontSize: 24, fontWeight: 700}}>Terms Accepted</h2><p>Thank you.</p></div>;

  return (
    <div style={{padding: 24}}>
      <h2 style={{fontSize: 24, fontWeight: 700}}>Terms and Conditions</h2>
      <p style={{color: '#666', marginBottom: 12}}>Scroll through the document before accepting.</p>
      <div ref={ref} style={{maxHeight: 300, overflow: 'auto', border: '1px solid #e0e0e0', borderRadius: 8, padding: 16, whiteSpace: 'pre-wrap'}}>{TERMS}</div>
      {!scrolled && <p style={{fontSize: 12, color: '#999'}}>Scroll to bottom to enable</p>}
      <label style={{display: 'flex', alignItems: 'center', gap: 8, marginTop: 12}}>
        <input type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)} disabled={!scrolled} />
        I have read and agree to the Terms
      </label>
      <button onClick={() => setSubmitted(true)} disabled={!accepted} style={{marginTop: 12, padding: '10px 20px', background: accepted ? '#2563eb' : '#ccc', color: 'white', border: 'none', borderRadius: 4, cursor: accepted ? 'pointer' : 'not-allowed'}}>Accept and Continue</button>
    </div>
  );
}
