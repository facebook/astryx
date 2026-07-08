// Copyright (c) Meta Platforms, Inc. and affiliates.

import {Card, CardContent} from '@/components/ui/card';

const cards = [
  {title: 'Design', description: 'Create beautiful interfaces with our component library.'},
  {title: 'Develop', description: 'Build fast with typed props and tree-shaking.'},
  {title: 'Deploy', description: 'Ship confidently with tested, accessible components.'},
];

export default function ResponsiveCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map(card => (
        <Card key={card.title}>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
            <p className="text-muted-foreground">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
