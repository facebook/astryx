// Copyright (c) Meta Platforms, Inc. and affiliates.

import React from 'react';
import {Card} from '@astryxdesign/core/Card';
import {VStack} from '@astryxdesign/core/VStack';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';
import stylex from '@stylexjs/stylex';

const styles = stylex.create({
  grid: {
    display: 'grid',
    gridTemplateColumns: {
      default: '1fr',
      '@media (min-width: 768px)': 'repeat(3, 1fr)',
    },
    gap: 16,
  },
});

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
    <VStack gap={4}>
      <Heading level={2}>Features</Heading>
      <div {...stylex.props(styles.grid)}>
        {items.map(item => (
          <Card key={item.title}>
            <VStack gap={2}>
              <Heading level={4}>{item.title}</Heading>
              <Text type="supporting">{item.description}</Text>
            </VStack>
          </Card>
        ))}
      </div>
    </VStack>
  );
}
