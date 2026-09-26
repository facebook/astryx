// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Carousel} from '@astryxdesign/core/Carousel';
import {Card} from '@astryxdesign/core/Card';
import {Stack} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';

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
      style={{maxWidth: 500}}>
      {ITEMS.map(item => (
        <Card key={item.title} padding={3} style={{minWidth: 200}}>
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
