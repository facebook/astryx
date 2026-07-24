// Copyright (c) Meta Platforms, Inc. and affiliates.

import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';

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
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Features</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map(item => (
          <Card key={item.title}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">{item.title}</CardTitle>
                <Badge variant="outline">{item.tag}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default ResponsiveCards;
