// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Carousel} from '@astryxdesign/core/Carousel';
import {Card} from '@astryxdesign/core/Card';
import {Stack} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  root: {
    maxWidth: 500,
  },
  card: {
    minWidth: 200,
  },
});

const ITEMS = [
  {title: 'Design', body: 'Create wireframes and prototypes.'},
  {title: 'Develop', body: 'Build components and pages.'},
  {title: 'Test', body: 'Write tests and fix bugs.'},
  {title: 'Deploy', body: 'Ship to production.'},
  {title: 'Monitor', body: 'Track performance and errors.'},
];

export default function CarouselShowcase() {
  return (
    <Carousel
      gap={2}
      hasSnap
      hasButtons={false}
      aria-label="Workflow steps"
      xstyle={styles.root}>
      {ITEMS.map(item => (
        <Card key={item.title} padding={3} xstyle={styles.card}>
          <Stack direction="vertical" gap={1}>
            <Heading level={5}>{item.title}</Heading>
            <Text type="supporting" color="secondary">
              {item.body}
            </Text>
          </Stack>
        </Card>
      ))}
    </Carousel>
  );
}
