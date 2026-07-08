// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';

const emails = [
  {id: '1', sender: 'Alice', subject: 'Project update', date: '2024-01-15', preview: 'Here is the latest on the project...'},
  {id: '2', sender: 'Bob', subject: 'Meeting notes', date: '2024-01-14', preview: 'Attached are the notes from today...'},
  {id: '3', sender: 'Carol', subject: 'Invoice #1234', date: '2024-01-13', preview: 'Please find the invoice attached...'},
  {id: '4', sender: 'Dave', subject: 'Quick question', date: '2024-01-12', preview: 'Hey, do you have a minute to chat?'},
  {id: '5', sender: 'Eve', subject: 'Welcome aboard', date: '2024-01-11', preview: 'Welcome to the team! Let me know if...'},
];

export default function EmailInbox() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) {next.delete(id);}
      else {next.add(id);}
      return next;
    });
  };

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <span style={{fontSize: 14, color: '#666'}}>{selected.size} selected</span>
        <div style={{position: 'relative'}}>
          <button onClick={() => setMenuOpen(!menuOpen)} style={{padding: '6px 12px', border: '1px solid #ccc', borderRadius: 4, background: 'white', cursor: 'pointer'}}>Actions \u25BC</button>
          {menuOpen && (
            <div style={{position: 'absolute', right: 0, top: '100%', marginTop: 4, background: 'white', border: '1px solid #ddd', borderRadius: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', minWidth: 150, zIndex: 10}}>
              <button style={{display: 'block', width: '100%', padding: '8px 12px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer'}}>Archive</button>
              <button style={{display: 'block', width: '100%', padding: '8px 12px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer'}}>Mark as read</button>
              <hr style={{margin: 0, border: 'none', borderTop: '1px solid #eee'}} />
              <button style={{display: 'block', width: '100%', padding: '8px 12px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', color: '#dc3545'}}>Delete</button>
            </div>
          )}
        </div>
      </div>
      <table style={{width: '100%', borderCollapse: 'collapse'}}>
        <thead>
          <tr style={{borderBottom: '2px solid #dee2e6'}}>
            <th style={{width: 40, padding: '8px'}}></th>
            <th style={{padding: '8px', textAlign: 'left'}}>From</th>
            <th style={{padding: '8px', textAlign: 'left'}}>Subject</th>
            <th style={{padding: '8px', textAlign: 'left'}}>Date</th>
            <th style={{padding: '8px', textAlign: 'left'}}>Preview</th>
          </tr>
        </thead>
        <tbody>
          {emails.map(email => (
            <tr key={email.id} style={{borderBottom: '1px solid #dee2e6'}}>
              <td style={{padding: '8px'}}>
                <input type="checkbox" checked={selected.has(email.id)} onChange={() => toggleSelect(email.id)} aria-label={`Select ${email.sender}`} />
              </td>
              <td style={{padding: '8px'}}>{email.sender}</td>
              <td style={{padding: '8px'}}>{email.subject}</td>
              <td style={{padding: '8px'}}>{email.date}</td>
              <td style={{padding: '8px', color: '#666'}}>{email.preview}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
