// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import {Selector} from '@astryxdesign/core/Selector';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Text} from '@astryxdesign/core/Text';
import {Heading} from '@astryxdesign/core/Heading';

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

const roleOptions = ['Viewer', 'Editor', 'Admin'];

export default function UserRoleAssignment() {
  const [members, setMembers] = useState<TeamMember[]>(initialMembers);

  function handleRoleChange(memberId: string, newRole: string) {
    setMembers(prev => prev.map(m => (m.id === memberId ? {...m, role: newRole} : m)));
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Heading level={2}>Team Role Assignment</Heading>
      <hr className="my-4" />
      <div className="flex flex-col gap-3">
        {members.map(member => (
          <div key={member.id} className="flex items-center gap-4">
            <Avatar name={member.name} size="md" />
            <div className="flex-1">
              <Text weight="semibold">{member.name}</Text>
              <Text color="secondary" size="sm">{member.email}</Text>
            </div>
            <Selector
              label={`Role for ${member.name}`}
              options={roleOptions}
              value={member.role}
              onChange={(value) => handleRoleChange(member.id, value)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
