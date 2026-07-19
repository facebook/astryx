// Copyright (c) Meta Platforms, Inc. and affiliates.

import {VStack} from '@astryxdesign/core/Stack';
import {HStack} from '@astryxdesign/core/Stack';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';
import {Avatar} from '@astryxdesign/core/Avatar';
import {HoverCard} from '@astryxdesign/core/HoverCard';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {Badge} from '@astryxdesign/core/Badge';

const members = [
  {name: 'Alice Johnson', role: 'Engineering Lead', email: 'alice@company.com', avatar: ''},
  {name: 'Bob Smith', role: 'Designer', email: 'bob@company.com', avatar: ''},
  {name: 'Carol Williams', role: 'Product Manager', email: 'carol@company.com', avatar: ''},
  {name: 'Dan Brown', role: 'Developer', email: 'dan@company.com', avatar: ''},
];

export default function TeamMembersList() {
  return (
    <Card>
      <VStack gap={3}>
        <Heading level={2}>Team Members</Heading>
        <Divider />
        {members.map(member => (
          <HoverCard
            key={member.name}
            content={
              <VStack gap={3}>
                <HStack gap={3} align="center">
                  <Avatar name={member.name} src={member.avatar} />
                  <VStack gap={0.5}>
                    <Text weight="semibold">{member.name}</Text>
                    <Badge label={member.role} variant="info" />
                  </VStack>
                </HStack>
                <Text color="secondary">{member.email}</Text>
                <Button label="Send Message" variant="secondary" size="sm" />
              </VStack>
            }
          >
            <HStack gap={3} align="center">
              <Avatar name={member.name} src={member.avatar} />
              <VStack gap={0.5}>
                <Text weight="semibold">{member.name}</Text>
                <Text color="secondary" type="supporting">{member.role}</Text>
              </VStack>
            </HStack>
          </HoverCard>
        ))}
      </VStack>
    </Card>
  );
}
