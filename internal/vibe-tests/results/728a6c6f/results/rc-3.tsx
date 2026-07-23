// Copyright (c) Meta Platforms, Inc. and affiliates.

import React from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';

const items = [
  {title: 'Analytics', description: 'Track key metrics and user behavior across your platform.'},
  {title: 'Automation', description: 'Set up workflows that run on schedule or in response to events.'},
  {title: 'Collaboration', description: 'Share dashboards and reports with your team in real time.'},
  {title: 'Security', description: 'Role-based access control and audit logging built in.'},
  {title: 'Integrations', description: 'Connect with Slack, GitHub, Jira, and 100+ other tools.'},
  {title: 'Support', description: '24/7 support with dedicated account management for enterprise.'},
];

export default function ResponsiveCards() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Features</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map(item => (
          <Card key={item.title}>
            <CardHeader><CardTitle>{item.title}</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">{item.description}</p></CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
