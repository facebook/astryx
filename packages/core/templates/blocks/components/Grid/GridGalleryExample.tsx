// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Grid} from '@astryxdesign/core/Grid';
import {Card} from '@astryxdesign/core/Card';
import {VStack} from '@astryxdesign/core/Stack';
import {Text} from '@astryxdesign/core/Text';

const cards = [
  {title: 'Getting Started', description: 'Learn the basics of the platform.'},
  {title: 'Components', description: 'Browse the full component library.'},
  {title: 'Design Tokens', description: 'Colors, spacing, and typography.'},
  {title: 'Theming', description: 'Customize the look and feel.'},
  {title: 'Accessibility', description: 'Build inclusive experiences.'},
  {title: 'Patterns', description: 'Common UI composition patterns.'},
];

export default function GridGalleryExample() {
  return (
    <Grid
      columns={{minWidth: 180}}
      gap={5}
      width="100%"
      style={{maxWidth: 400}}>
      {cards.map(card => (
        <Card key={card.title}>
          <VStack gap={1}>
            <Text type="label" display="block">
              {card.title}
            </Text>
            <Text type="supporting" display="block">
              {card.description}
            </Text>
          </VStack>
        </Card>
      ))}
    </Grid>
  );
}
