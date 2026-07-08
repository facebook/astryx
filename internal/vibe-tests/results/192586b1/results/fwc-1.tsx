// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';

export default function TrialExpirationBanner({daysLeft = 7}: {daysLeft?: number}) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {return null;}

  return (
    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#fff3cd', border: '1px solid #ffc107', borderRadius: 8}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
        <span style={{fontSize: 20}}>\u26A0\uFE0F</span>
        <div>
          <strong>Your trial expires in {daysLeft} day{daysLeft !== 1 ? 's' : ''}</strong>
          <p style={{margin: 0, fontSize: 14, color: '#856404'}}>Upgrade now to keep access to all features.</p>
        </div>
      </div>
      <div style={{display: 'flex', gap: 8}}>
        <button style={{padding: '6px 12px', backgroundColor: '#0d6efd', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer'}}>Upgrade</button>
        <button onClick={() => setDismissed(true)} style={{padding: '6px 12px', backgroundColor: 'transparent', border: '1px solid #ccc', borderRadius: 4, cursor: 'pointer'}} aria-label="Dismiss">\u2715</button>
      </div>
    </div>
  );
}
