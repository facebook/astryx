// Copyright (c) Meta Platforms, Inc. and affiliates.

import React from 'react';

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
    <div style={{padding: 24, fontFamily: 'system-ui'}}>
      <h2 style={{margin: '0 0 16px'}}>Features</h2>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16}}>
        {items.map(item => (
          <div key={item.title} style={{border: '1px solid #e5e5e5', borderRadius: 8, padding: 20}}>
            <h4 style={{margin: '0 0 8px', fontSize: 16}}>{item.title}</h4>
            <p style={{margin: 0, fontSize: 14, color: '#666'}}>{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
