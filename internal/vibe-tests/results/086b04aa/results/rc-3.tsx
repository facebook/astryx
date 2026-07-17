// Copyright (c) Meta Platforms, Inc. and affiliates.

import {Grid} from '@astryxdesign/core/Grid';
import {Card} from '@astryxdesign/core/Card';
import {VStack} from '@astryxdesign/core/Stack';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';

const items = [
  {id: '1', title: 'Getting Started', description: 'Learn the basics of setting up your development environment.', tag: 'Guide'},
  {id: '2', title: 'Component Library', description: 'Browse the full catalog of reusable UI components.', tag: 'Reference'},
  {id: '3', title: 'Theming', description: 'Customize colors, typography, and spacing to match your brand.', tag: 'Guide'},
  {id: '4', title: 'Accessibility', description: 'Ensure your application is usable by everyone.', tag: 'Best Practices'},
  {id: '5', title: 'Performance', description: 'Tips for keeping your app fast and responsive.', tag: 'Advanced'},
  {id: '6', title: 'Migration Guide', description: 'Steps to upgrade from the previous version.', tag: 'Reference'},
];

export default function ResponsiveCards() {
  return (
    <Grid columns={{minWidth: 300, max: 3}} gap={4} padding={4}>
      {items.map((item) => (
        <Card key={item.id} padding={4}>
          <VStack gap={2}>
            <Badge variant="accent">{item.tag}</Badge>
            <Heading level={3}>{item.title}</Heading>
            <Text type="supporting">{item.description}</Text>
          </VStack>
        </Card>
      ))}
    </Grid>
  );
}
