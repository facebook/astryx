// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';

interface Member {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  joinedAt: string;
}

const members: Member[] = [
  {id: '1', name: 'Sarah Lee', role: 'Engineering Lead', department: 'Frontend', email: 'sarah@example.com', joinedAt: '2022-03-15'},
  {id: '2', name: 'Marcus Chen', role: 'Senior Designer', department: 'Design', email: 'marcus@example.com', joinedAt: '2021-08-01'},
  {id: '3', name: 'Priya Patel', role: 'Product Manager', department: 'Product', email: 'priya@example.com', joinedAt: '2023-01-10'},
  {id: '4', name: 'James Wilson', role: 'Backend Engineer', department: 'Infrastructure', email: 'james@example.com', joinedAt: '2022-11-20'},
];

export default function TeamMembersList() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div style={{maxWidth: 500, padding: 24}}>
      <h2 style={{fontSize: 20, fontWeight: 'bold', marginBottom: 16}}>Team Members</h2>
      {members.map(member => (
        <div key={member.id} style={{position: 'relative'}}>
          <div
            onMouseEnter={() => setHoveredId(member.id)}
            onMouseLeave={() => setHoveredId(null)}
            style={{display: 'flex', alignItems: 'center', gap: 12, padding: 8, cursor: 'pointer', borderRadius: 4, backgroundColor: hoveredId === member.id ? '#f5f5f5' : 'transparent'}}
          >
            <div style={{width: 32, height: 32, borderRadius: '50%', backgroundColor: '#ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 'bold'}}>
              {member.name.split(' ').map(n => n[0]).join('')}
            </div>
            <span style={{fontWeight: 500}}>{member.name}</span>
            <span style={{marginLeft: 'auto', fontSize: 12, backgroundColor: '#eee', padding: '2px 8px', borderRadius: 4}}>{member.department}</span>
          </div>
          {hoveredId === member.id && (
            <div style={{position: 'absolute', left: '100%', top: 0, marginLeft: 8, backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: 8, padding: 16, width: 240, zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}>
              <div style={{display: 'flex', gap: 12, marginBottom: 12}}>
                <div style={{width: 48, height: 48, borderRadius: '50%', backgroundColor: '#ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'}}>
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div style={{fontWeight: 'bold'}}>{member.name}</div>
                  <div style={{fontSize: 13, color: '#666'}}>{member.role}</div>
                </div>
              </div>
              <hr style={{margin: '8px 0'}} />
              <div style={{fontSize: 12, color: '#666'}}>
                <p>Email: {member.email}</p>
                <p>Department: {member.department}</p>
                <p>Joined: {new Date(member.joinedAt).toLocaleDateString()}</p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
