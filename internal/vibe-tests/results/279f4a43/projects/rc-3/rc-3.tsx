// Copyright (c) Meta Platforms, Inc. and affiliates.

import {Card, CardContent, CardHeader, CardTitle} from '../components/ui/card';
import {Badge} from '../components/ui/badge';

const items = [
  {id: '1', title: 'Getting Started', description: 'Learn the basics of setting up your development environment.', tag: 'Guide'},
  {id: '2', title: 'Component Library', description: 'Browse the full catalog of reusable UI components.', tag: 'Reference'},
  {id: '3', title: 'Theming', description: 'Customize colors, typography, and spacing.', tag: 'Guide'},
  {id: '4', title: 'Accessibility', description: 'Ensure your application is usable by everyone.', tag: 'Best Practices'},
  {id: '5', title: 'Performance', description: 'Tips for keeping your app fast and responsive.', tag: 'Advanced'},
  {id: '6', title: 'Migration Guide', description: 'Steps to upgrade from the previous version.', tag: 'Reference'},
];

export default function ResponsiveCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
      {items.map((item) => (
        <Card key={item.id}>
          <CardHeader>
            <Badge className="w-fit mb-2">{item.tag}</Badge>
            <CardTitle>{item.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{item.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
