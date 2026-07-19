// Copyright (c) Meta Platforms, Inc. and affiliates.

import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';
import {Card} from '@astryxdesign/core/Card';
import {Badge} from '@astryxdesign/core/Badge';

const items = [
  {title: 'Analytics', description: 'Track user behavior and conversion rates', tag: 'Popular'},
  {title: 'Integrations', description: 'Connect with your favorite tools and services', tag: 'New'},
  {title: 'Automation', description: 'Set up workflows to save time on repetitive tasks', tag: ''},
  {title: 'Security', description: 'Enterprise-grade security and compliance features', tag: 'Enterprise'},
];

export default function ResponsiveCards() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <Heading level={2}>Features</Heading>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map(item => (
          <Card key={item.title}>
            <div className="flex flex-col gap-2 p-3">
              <Heading level={3}>{item.title}</Heading>
              <Text color="secondary">{item.description}</Text>
              {item.tag && <Badge label={item.tag} variant="info" />}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
