import {useState} from 'react';

export default function DeleteConfirmation() {
  const [isOpen, setIsOpen] = useState(true);
  if (!isOpen) return null;

  return (
    <div style={{position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)'}}>
      <div style={{backgroundColor: 'white', borderRadius: 8, padding: 24, width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.15)'}}>
        <h3 style={{margin: '0 0 8px'}}>Delete Item</h3>
        <p style={{color: '#666'}}>Are you sure you want to delete this item? This action cannot be undone.</p>
        <div style={{display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16}}>
          <button onClick={() => setIsOpen(false)} style={{padding: '8px 16px', border: '1px solid #ccc', borderRadius: 4, cursor: 'pointer'}}>Cancel</button>
          <button onClick={() => setIsOpen(false)} style={{padding: '8px 16px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer'}}>Delete</button>
        </div>
      </div>
    </div>
  );
}
