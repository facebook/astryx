// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
}

const initialMembers: TeamMember[] = [
  {id: '1', name: 'Alice Chen', email: 'alice@example.com', role: 'Editor'},
  {id: '2', name: 'Bob Martinez', email: 'bob@example.com', role: 'Viewer'},
  {id: '3', name: 'Carol Johnson', email: 'carol@example.com', role: 'Admin'},
  {id: '4', name: 'Dan Williams', email: 'dan@example.com', role: 'Viewer'},
];

export default function UserRoleAssignment() {
  const [members, setMembers] = useState<TeamMember[]>(initialMembers);

  function handleRoleChange(memberId: string, newRole: string) {
    setMembers(prev => prev.map(m => (m.id === memberId ? {...m, role: newRole} : m)));
  }

  return (
    <div style={{maxWidth: 600, margin: '0 auto', padding: 24}}>
      <h2 style={{fontSize: 24, fontWeight: 'bold', marginBottom: 16}}>Team Role Assignment</h2>
      <hr style={{marginBottom: 16}} />
      <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
        {members.map(member => (
          <div key={member.id} style={{display: 'flex', alignItems: 'center', gap: 12, padding: 8, borderBottom: '1px solid #eee'}}>
            <div style={{width: 40, height: 40, borderRadius: '50%', backgroundColor: '#ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'}}>
              {member.name[0]}
            </div>
            <div style={{flex: 1}}>
              <div style={{fontWeight: 600}}>{member.name}</div>
              <div style={{fontSize: 12, color: '#666'}}>{member.email}</div>
            </div>
            <select
              value={member.role}
              onChange={(e) => handleRoleChange(member.id, e.target.value)}
              style={{padding: '6px 12px', borderRadius: 4, border: '1px solid #ccc'}}
              aria-label={`Role for ${member.name}`}
            >
              <option value="Viewer">Viewer</option>
              <option value="Editor">Editor</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
