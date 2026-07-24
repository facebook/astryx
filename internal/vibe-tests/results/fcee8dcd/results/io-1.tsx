// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState, useCallback} from 'react';

function validateEmail(email: string): string | null {
  if (!email) {return 'Email is required';}
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {return 'Please enter a valid email address';}
  return null;
}

export function SubscribeForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback(async () => {
    const validationError = validateEmail(email);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email}),
      });
      if (!response.ok) {throw new Error('Subscription failed');}
      setSuccess(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [email]);

  if (success) {
    return (
      <div style={{padding: 16, borderRadius: 8, backgroundColor: '#dcfce7', border: '1px solid #86efac'}}>
        <strong>Subscribed!</strong>
        <p style={{margin: '4px 0 0'}}>You have been subscribed with {email}.</p>
      </div>
    );
  }

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16, padding: 24, maxWidth: 360, margin: '0 auto', fontFamily: 'system-ui, sans-serif'}}>
      <h2 style={{margin: 0, fontSize: 24, fontWeight: 700}}>Subscribe to updates</h2>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <label style={{fontWeight: 500}}>Email address</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" style={{padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6}} />
        {error && <p style={{margin: 0, fontSize: 13, color: '#dc2626'}}>{error}</p>}
      </div>
      <button onClick={handleSubmit} disabled={isLoading} style={{padding: '10px 20px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: 6, cursor: isLoading ? 'not-allowed' : 'pointer', fontWeight: 500, opacity: isLoading ? 0.6 : 1}}>
        {isLoading ? 'Subscribing...' : 'Subscribe'}
      </button>
    </div>
  );
}

export default SubscribeForm;
