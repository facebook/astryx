// Copyright (c) Meta Platforms, Inc. and affiliates.

import {Avatar} from '@astryxdesign/core/Avatar';
import {HoverCard} from '@astryxdesign/core/HoverCard';
import {Text} from '@astryxdesign/core/Text';
import {VStack} from '@astryxdesign/core/VStack';
import {HStack} from '@astryxdesign/core/HStack';
import {Heading} from '@astryxdesign/core/Heading';
import {Badge} from '@astryxdesign/core/Badge';
import {Divider} from '@astryxdesign/core/Divider';

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
  return (
    <VStack gap="md">
      <Heading level={2}>Team Members</Heading>
      <VStack gap="sm">
        {members.map(member => (
          <HoverCard
            key={member.id}
            trigger={
              <HStack gap="sm" align="center" style={{cursor: 'pointer', padding: 'var(--xds-spacing-sm)'}}>
                <Avatar name={member.name} size="sm" />
                <Text weight="semibold">{member.name}</Text>
                <Badge variant="neutral">{member.department}</Badge>
              </HStack>
            }
          >
            <VStack gap="sm" style={{padding: 'var(--xds-spacing-md)', minWidth: 250}}>
              <HStack gap="md" align="center">
                <Avatar name={member.name} size="lg" />
                <VStack gap="xs">
                  <Text weight="bold" size="lg">{member.name}</Text>
                  <Text color="secondary">{member.role}</Text>
                </VStack>
              </HStack>
              <Divider />
              <VStack gap="xs">
                <Text size="sm" color="secondary">Email: {member.email}</Text>
                <Text size="sm" color="secondary">Department: {member.department}</Text>
                <Text size="sm" color="secondary">Joined: {new Date(member.joinedAt).toLocaleDateString()}</Text>
              </VStack>
            </VStack>
          </HoverCard>
        ))}
      </VStack>
    </VStack>
  );
}
