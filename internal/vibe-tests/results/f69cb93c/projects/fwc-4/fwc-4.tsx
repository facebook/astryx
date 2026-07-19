// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';

export default function ConfirmDeleteDialog() {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) {return null;}

  return (
    <div style={{position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000}}>
      <div style={{backgroundColor: 'white', borderRadius: 8, padding: 24, maxWidth: 400, width: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.15)'}}>
        <h2 style={{margin: '0 0 12px', fontSize: 18, fontWeight: 600}}>Are you sure you want to delete this item?</h2>
        <p style={{margin: '0 0 20px', color: '#666'}}>This action cannot be undone. The item will be permanently removed.</p>
        <div style={{display: 'flex', gap: 8, justifyContent: 'flex-end'}}>
          <button onClick={() => setIsOpen(false)} style={{padding: '8px 16px', border: '1px solid #ddd', borderRadius: 4, background: 'white', cursor: 'pointer'}}>Cancel</button>
          <button onClick={() => setIsOpen(false)} style={{padding: '8px 16px', border: 'none', borderRadius: 4, background: '#dc2626', color: 'white', cursor: 'pointer'}}>Delete</button>
        </div>
      </div>
    </div>
  );
}
