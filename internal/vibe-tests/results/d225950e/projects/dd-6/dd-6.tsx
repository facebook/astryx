// Copyright (c) Meta Platforms, Inc. and affiliates.

import {Avatar} from '@astryxdesign/core/Avatar';
import {HoverCard} from '@astryxdesign/core/HoverCard';
import {Button} from '@astryxdesign/core/Button';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';
import {Card} from '@astryxdesign/core/Card';
import {Badge} from '@astryxdesign/core/Badge';
import {Divider} from '@astryxdesign/core/Divider';

const members = [
  {name: 'Alice Johnson', role: 'Engineering Lead', email: 'alice@company.com'},
  {name: 'Bob Smith', role: 'Designer', email: 'bob@company.com'},
  {name: 'Carol Williams', role: 'Product Manager', email: 'carol@company.com'},
  {name: 'Dan Brown', role: 'Developer', email: 'dan@company.com'},
];

export default function TeamMembersList() {
  return (
    <Card>
      <div className="flex flex-col gap-3 p-4">
        <Heading level={2}>Team Members</Heading>
        <Divider />
        {members.map(member => (
          <HoverCard
            key={member.name}
            content={
              <div className="flex flex-col gap-3 p-2">
                <div className="flex items-center gap-3">
                  <Avatar name={member.name} />
                  <div className="flex flex-col gap-0.5">
                    <Text weight="semibold">{member.name}</Text>
                    <Badge label={member.role} variant="info" />
                  </div>
                </div>
                <Text color="secondary">{member.email}</Text>
                <Button label="Send Message" variant="secondary" size="sm" />
              </div>
            }
          >
            <div className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer">
              <Avatar name={member.name} />
              <div className="flex flex-col">
                <Text weight="semibold">{member.name}</Text>
                <Text color="secondary" type="supporting">{member.role}</Text>
              </div>
            </div>
          </HoverCard>
        ))}
      </div>
    </Card>
  );
}
