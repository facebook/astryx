// Copyright (c) Meta Platforms, Inc. and affiliates.

import {Card} from '@astryxdesign/core/Card';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Stack} from '@astryxdesign/core/Stack';

interface CardItem {
  title: string;
  description: string;
  tag: string;
}

const items: CardItem[] = [
  {title: 'Analytics Dashboard', description: 'Track user engagement and conversion metrics.', tag: 'Active'},
  {title: 'Email Campaigns', description: 'Create and schedule automated email sequences.', tag: 'Beta'},
  {title: 'Team Collaboration', description: 'Share projects and collaborate in real-time.', tag: 'New'},
];

export function ResponsiveCards() {
  return (
    <div className="p-6">
      <Heading level={2}>Features</Heading>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {items.map(item => (
          <Card key={item.title} padding={3}>
            <Stack gap={2}>
              <div className="flex justify-between items-center">
                <Heading level={3}>{item.title}</Heading>
                <Badge label={item.tag} />
              </div>
              <Text color="secondary">{item.description}</Text>
            </Stack>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default ResponsiveCards;
