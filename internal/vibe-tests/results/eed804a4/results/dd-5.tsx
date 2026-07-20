import {useState} from 'react';

const emails = [
  {id: '1', sender: 'Alice Chen', subject: 'Project Update', date: '2024-01-15', preview: 'Hey, just wanted to share...', isRead: false},
  {id: '2', sender: 'Bob Smith', subject: 'Meeting Notes', date: '2024-01-14', preview: 'Here are the notes...', isRead: true},
  {id: '3', sender: 'Carol Davis', subject: 'Review Request', date: '2024-01-14', preview: 'Could you take a look...', isRead: false},
  {id: '4', sender: 'Dan Wilson', subject: 'Lunch plans', date: '2024-01-13', preview: 'Want to grab lunch?', isRead: true},
];

export default function EmailInbox() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const toggle = (id: string) => { setSelected(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; }); };

  return (
    <div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16}}>
        <h2 style={{fontSize: 18, fontWeight: 600}}>Inbox</h2>
        {selected.size > 0 && <button style={{padding: '4px 12px', border: '1px solid #ccc', borderRadius: 4}}>Actions ({selected.size})</button>}
      </div>
      <table style={{width: '100%', borderCollapse: 'collapse'}}>
        <thead><tr style={{borderBottom: '1px solid #e0e0e0'}}><th style={{width: 40, padding: 8}} /><th style={{padding: 8, textAlign: 'left'}}>From</th><th style={{padding: 8, textAlign: 'left'}}>Subject</th><th style={{padding: 8, textAlign: 'left'}}>Date</th><th style={{padding: 8, textAlign: 'left'}}>Preview</th></tr></thead>
        <tbody>
          {emails.map(e => (
            <tr key={e.id} style={{borderBottom: '1px solid #f0f0f0'}}>
              <td style={{padding: 8}}><input type="checkbox" checked={selected.has(e.id)} onChange={() => toggle(e.id)} /></td>
              <td style={{padding: 8, fontWeight: e.isRead ? 400 : 600}}>{e.sender}</td>
              <td style={{padding: 8}}>{e.subject}</td>
              <td style={{padding: 8, color: '#666'}}>{e.date}</td>
              <td style={{padding: 8, color: '#666', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{e.preview}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
