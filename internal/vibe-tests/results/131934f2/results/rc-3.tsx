// Copyright (c) Meta Platforms, Inc. and affiliates.

import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';

const items = [
  {title: 'Analytics', description: 'Track user behavior and conversion rates', tag: 'Popular'},
  {title: 'Integrations', description: 'Connect with your favorite tools and services', tag: 'New'},
  {title: 'Automation', description: 'Set up workflows to save time on repetitive tasks', tag: ''},
  {title: 'Security', description: 'Enterprise-grade security and compliance features', tag: 'Enterprise'},
];

export default function ResponsiveCards() {
  return (
    <div className="space-y-4 p-4">
      <h2 className="text-2xl font-bold">Features</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map(item => (
          <Card key={item.title}>
            <CardHeader>
              <CardTitle className="text-lg">{item.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-muted-foreground">{item.description}</p>
              {item.tag && <Badge variant="secondary">{item.tag}</Badge>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
