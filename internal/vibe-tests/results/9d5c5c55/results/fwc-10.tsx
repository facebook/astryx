// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import {Selector} from '@astryxdesign/core/Selector';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Text} from '@astryxdesign/core/Text';
import {VStack} from '@astryxdesign/core/VStack';
import {HStack} from '@astryxdesign/core/HStack';
import {Heading} from '@astryxdesign/core/Heading';
import {Divider} from '@astryxdesign/core/Divider';
import {Toast} from '@astryxdesign/core/Toast';

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
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  function handleRoleChange(memberId: string, newRole: string) {
    setMembers(prev =>
      prev.map(m => (m.id === memberId ? {...m, role: newRole} : m)),
    );
    setSavedMessage(`Role updated to ${newRole}`);
    setTimeout(() => setSavedMessage(null), 2000);
  }

  return (
    <VStack gap="lg">
      <Heading level={2}>Team Role Assignment</Heading>
      <Divider />
      <VStack gap="md">
        {members.map(member => (
          <HStack key={member.id} gap="md" align="center">
            <Avatar name={member.name} size="md" />
            <VStack gap="xs" style={{flex: 1}}>
              <Text weight="semibold">{member.name}</Text>
              <Text color="secondary" size="sm">{member.email}</Text>
            </VStack>
            <Selector
              label={`Role for ${member.name}`}
              options={roleOptions}
              value={member.role}
              onChange={(value) => handleRoleChange(member.id, value)}
            />
          </HStack>
        ))}
      </VStack>
      {savedMessage && <Toast variant="success">{savedMessage}</Toast>}
    </VStack>
  );
}
