// Copyright (c) Meta Platforms, Inc. and affiliates.

import {Card} from '@astryxdesign/core/Card';
import {Stack} from '@astryxdesign/core/Stack';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
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
    <Stack gap={4} padding={4}>
      <Heading level={2}>Features</Heading>
      <div {...stylex.props(styles.grid)}>
        {items.map(item => (
          <Card key={item.title} padding={3}>
            <Stack gap={2}>
              <Stack direction="row" justify="between" align="center">
                <Heading level={3}>{item.title}</Heading>
                <Badge label={item.tag} />
              </Stack>
              <Text color="secondary">{item.description}</Text>
            </Stack>
          </Card>
        ))}
      </div>
    </Stack>
  );
}

export default ResponsiveCards;
