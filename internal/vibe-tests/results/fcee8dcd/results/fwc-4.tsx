// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';

export function DeleteConfirmationDialog() {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) {return null;}

  return (
    <div style={{position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000}}>
      <div style={{backgroundColor: 'white', borderRadius: 8, padding: 24, maxWidth: 420, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)'}}>
        <h2 style={{margin: '0 0 12px', fontSize: 18, fontWeight: 600}}>Are you sure you want to delete this item?</h2>
        <p style={{margin: '0 0 24px', color: '#666'}}>This action cannot be undone. The item will be permanently removed.</p>
        <div style={{display: 'flex', justifyContent: 'flex-end', gap: 8}}>
          <button onClick={() => setIsOpen(false)} style={{padding: '8px 16px', border: '1px solid #ddd', borderRadius: 6, backgroundColor: 'white', cursor: 'pointer'}}>Cancel</button>
          <button onClick={() => setIsOpen(false)} style={{padding: '8px 16px', border: 'none', borderRadius: 6, backgroundColor: '#dc2626', color: 'white', cursor: 'pointer', fontWeight: 500}}>Delete</button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmationDialog;
