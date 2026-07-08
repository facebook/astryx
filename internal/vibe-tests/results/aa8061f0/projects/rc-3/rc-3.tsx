// Copyright (c) Meta Platforms, Inc. and affiliates.

import {Card} from '@astryxdesign/core/Card';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';
import {VStack} from '@astryxdesign/core/VStack';
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: 16,
    '@media (min-width: 768px)': {
      gridTemplateColumns: 'repeat(3, 1fr)',
    },
  },
});

const cards = [
  {title: 'Design', description: 'Create beautiful interfaces with our component library.'},
  {title: 'Develop', description: 'Build fast with typed props and tree-shaking.'},
  {title: 'Deploy', description: 'Ship confidently with tested, accessible components.'},
];

export default function ResponsiveCards() {
  return (
    <div {...stylex.props(styles.grid)}>
      {cards.map(card => (
        <Card key={card.title} padding={4}>
          <VStack gap={2}>
            <Heading level={3}>{card.title}</Heading>
            <Text color="secondary">{card.description}</Text>
          </VStack>
        </Card>
      ))}
    </div>
  );
}
