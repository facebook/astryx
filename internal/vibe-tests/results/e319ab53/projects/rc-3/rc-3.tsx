// Copyright (c) Meta Platforms, Inc. and affiliates.

import React from 'react';
import {Card} from '@astryxdesign/core/Card';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';

const items = [
  {title: 'Analytics', description: 'Track key metrics and user behavior across your platform.'},
  {title: 'Automation', description: 'Set up workflows that run on schedule or in response to events.'},
  {title: 'Collaboration', description: 'Share dashboards and reports with your team in real time.'},
  {title: 'Security', description: 'Role-based access control and audit logging built in.'},
  {title: 'Integrations', description: 'Connect with Slack, GitHub, Jira, and 100+ other tools.'},
  {title: 'Support', description: '24/7 support with dedicated account management for enterprise.'},
];

export default function ResponsiveCards() {
  return (
    <div className="p-6">
      <Heading level={2}>Features</Heading>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {items.map(item => (
          <Card key={item.title}>
            <div className="flex flex-col gap-2">
              <Heading level={4}>{item.title}</Heading>
              <Text type="supporting">{item.description}</Text>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
