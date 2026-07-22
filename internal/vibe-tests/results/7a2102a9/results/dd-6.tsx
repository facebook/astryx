import {useState} from 'react';

const MEMBERS = [
  {name: 'Alice Chen', role: 'Engineering Lead', email: 'alice@co.com', avatar: 'https://i.pravatar.cc/48?u=alice'},
  {name: 'Bob Smith', role: 'Designer', email: 'bob@co.com', avatar: 'https://i.pravatar.cc/48?u=bob'},
  {name: 'Carol Park', role: 'PM', email: 'carol@co.com', avatar: 'https://i.pravatar.cc/48?u=carol'},
];

export default function TeamMembers() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div style={{fontFamily: 'system-ui', padding: 16}}>
      <h3>Team Members</h3>
      {MEMBERS.map(m => (
        <div key={m.name} style={{position: 'relative', padding: '8px 0'}}>
          <span onMouseEnter={() => setHovered(m.name)} onMouseLeave={() => setHovered(null)} style={{fontWeight: 500, cursor: 'pointer'}}>{m.name}</span>
          {hovered === m.name && (
            <div style={{position: 'absolute', top: -10, left: 150, border: '1px solid #ddd', borderRadius: 8, padding: 16, backgroundColor: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: 250, zIndex: 10}}>
              <div style={{display: 'flex', gap: 12}}>
                <img src={m.avatar} alt="" style={{width: 48, height: 48, borderRadius: '50%'}} />
                <div>
                  <p style={{margin: 0, fontWeight: 600}}>{m.name}</p>
                  <p style={{margin: '2px 0', color: '#666', fontSize: 14}}>{m.role}</p>
                  <p style={{margin: '2px 0', fontSize: 14}}>{m.email}</p>
                  <button style={{marginTop: 8, padding: '4px 12px', border: '1px solid #ccc', borderRadius: 4, cursor: 'pointer'}}>Message</button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
