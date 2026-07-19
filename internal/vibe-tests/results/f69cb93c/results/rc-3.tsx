// Copyright (c) Meta Platforms, Inc. and affiliates.

const items = [
  {title: 'Analytics', description: 'Track user behavior and conversion rates', tag: 'Popular'},
  {title: 'Integrations', description: 'Connect with your favorite tools and services', tag: 'New'},
  {title: 'Automation', description: 'Set up workflows to save time on repetitive tasks', tag: ''},
  {title: 'Security', description: 'Enterprise-grade security and compliance features', tag: 'Enterprise'},
];

export default function ResponsiveCards() {
  return (
    <div style={{padding: 16}}>
      <h2 style={{fontSize: 24, fontWeight: 700, marginBottom: 16}}>Features</h2>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16}}>
        {items.map(item => (
          <div key={item.title} style={{border: '1px solid #e5e7eb', borderRadius: 8, padding: 20}}>
            <h3 style={{fontSize: 16, fontWeight: 600, marginBottom: 8}}>{item.title}</h3>
            <p style={{color: '#6b7280', marginBottom: 8, fontSize: 14}}>{item.description}</p>
            {item.tag && <span style={{background: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: 12, fontSize: 11}}>{item.tag}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
