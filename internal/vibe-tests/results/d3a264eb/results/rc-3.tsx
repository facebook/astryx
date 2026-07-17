// Copyright (c) Meta Platforms, Inc. and affiliates.

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
    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, padding: 24}}>
      {items.map((item) => (
        <div key={item.id} style={{border: '1px solid #e2e8f0', borderRadius: 12, padding: 20}}>
          <span style={{display: 'inline-block', padding: '2px 8px', borderRadius: 12, fontSize: 12, background: '#ede9fe', color: '#6d28d9', marginBottom: 8}}>{item.tag}</span>
          <h3 style={{fontSize: 18, fontWeight: 600, marginBottom: 4}}>{item.title}</h3>
          <p style={{fontSize: 14, color: '#64748b', margin: 0}}>{item.description}</p>
        </div>
      ))}
    </div>
  );
}
