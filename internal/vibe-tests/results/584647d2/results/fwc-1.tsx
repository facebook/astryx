// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';

export default function TrialExpirationBanner({daysLeft}: {daysLeft: number}) {
  const [isDismissed, setIsDismissed] = useState(false);
  if (isDismissed) {return null;}

  return (
    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#fff3cd', border: '1px solid #ffc107', borderRadius: 8}}>
      <div>
        <strong>Trial Expiring</strong>
        <p style={{margin: '4px 0 0', fontSize: 14}}>Your trial expires in {daysLeft} day{daysLeft === 1 ? '' : 's'}. Upgrade to keep access.</p>
      </div>
      <div style={{display: 'flex', gap: 8}}>
        <button style={{padding: '8px 16px', backgroundColor: '#0066cc', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer'}}>Upgrade</button>
        <button onClick={() => setIsDismissed(true)} style={{background: 'none', border: 'none', cursor: 'pointer', fontSize: 18}}>&times;</button>
      </div>
    </div>
  );
}
