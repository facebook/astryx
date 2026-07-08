// Copyright (c) Meta Platforms, Inc. and affiliates.

import {Card} from '@astryxdesign/core/Card';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';

const cards = [
  {title: 'Design', description: 'Create beautiful interfaces with our component library.'},
  {title: 'Develop', description: 'Build fast with typed props and tree-shaking.'},
  {title: 'Deploy', description: 'Ship confidently with tested, accessible components.'},
];

export default function ResponsiveCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map(card => (
        <Card key={card.title} padding={4}>
          <div className="flex flex-col gap-2">
            <Heading level={3}>{card.title}</Heading>
            <Text color="secondary">{card.description}</Text>
          </div>
        </Card>
      ))}
    </div>
  );
}
