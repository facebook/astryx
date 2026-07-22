import {Card, Text, VStack, HStack, Avatar, Button, HoverCard, Heading} from '@astryxdesign/core';

const MEMBERS = [
  {name: 'Alice Chen', role: 'Engineering Lead', email: 'alice@company.com', avatar: 'https://i.pravatar.cc/48?u=alice'},
  {name: 'Bob Smith', role: 'Designer', email: 'bob@company.com', avatar: 'https://i.pravatar.cc/48?u=bob'},
  {name: 'Carol Park', role: 'Product Manager', email: 'carol@company.com', avatar: 'https://i.pravatar.cc/48?u=carol'},
];

export default function TeamMembersList() {
  return (
    <Card padding={4}>
      <VStack gap={3}>
        <Heading level={3}>Team Members</Heading>
        {MEMBERS.map(member => (
          <HoverCard key={member.name} trigger={
            <Text weight="semibold" style={{cursor: 'pointer'}}>{member.name}</Text>
          }>
            <Card padding={3} width={280}>
              <VStack gap={2}>
                <HStack gap={2}>
                  <Avatar src={member.avatar} name={member.name} size="lg" />
                  <VStack gap={0.5}>
                    <Text weight="semibold">{member.name}</Text>
                    <Text type="supporting" color="secondary">{member.role}</Text>
                  </VStack>
                </HStack>
                <Text type="supporting">{member.email}</Text>
                <Button label="Message" variant="secondary" size="sm" />
              </VStack>
            </Card>
          </HoverCard>
        ))}
      </VStack>
    </Card>
  );
}
