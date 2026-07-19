// Copyright (c) Meta Platforms, Inc. and affiliates.

const members = [
  {name: 'Alice Johnson', role: 'Engineering Lead', email: 'alice@company.com', initials: 'AJ'},
  {name: 'Bob Smith', role: 'Designer', email: 'bob@company.com', initials: 'BS'},
  {name: 'Carol Williams', role: 'Product Manager', email: 'carol@company.com', initials: 'CW'},
  {name: 'Dan Brown', role: 'Developer', email: 'dan@company.com', initials: 'DB'},
];

import {useState} from 'react';

export default function TeamMembersList() {
  const [hoveredMember, setHoveredMember] = useState(null);

  return (
    <div style={{border: '1px solid #e5e7eb', borderRadius: 8, padding: 24, maxWidth: 400}}>
      <h2 style={{margin: '0 0 16px', fontSize: 20, fontWeight: 600}}>Team Members</h2>
      <hr style={{border: 'none', borderTop: '1px solid #e5e7eb', margin: '0 0 12px'}} />
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        {members.map(member => (
          <div key={member.name} style={{position: 'relative'}} onMouseEnter={() => setHoveredMember(member.name)} onMouseLeave={() => setHoveredMember(null)}>
            <div style={{display: 'flex', alignItems: 'center', gap: 12, padding: 8, borderRadius: 6, cursor: 'pointer', background: hoveredMember === member.name ? '#f3f4f6' : 'transparent'}}>
              <div style={{width: 36, height: 36, borderRadius: '50%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600}}>{member.initials}</div>
              <div><div style={{fontWeight: 500}}>{member.name}</div><div style={{fontSize: 12, color: '#6b7280'}}>{member.role}</div></div>
            </div>
            {hoveredMember === member.name && (
              <div style={{position: 'absolute', left: '100%', top: 0, marginLeft: 8, background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, width: 240, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 10}}>
                <div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8}}>
                  <div style={{width: 40, height: 40, borderRadius: '50%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600}}>{member.initials}</div>
                  <div><div style={{fontWeight: 600}}>{member.name}</div><span style={{background: '#dbeafe', color: '#1e40af', padding: '2px 6px', borderRadius: 4, fontSize: 11}}>{member.role}</span></div>
                </div>
                <div style={{fontSize: 13, color: '#6b7280', marginBottom: 12}}>{member.email}</div>
                <button style={{padding: '6px 12px', border: '1px solid #d1d5db', borderRadius: 4, background: 'white', cursor: 'pointer', fontSize: 13}}>Send Message</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
