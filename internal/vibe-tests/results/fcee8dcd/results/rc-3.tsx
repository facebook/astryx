// Copyright (c) Meta Platforms, Inc. and affiliates.

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
    <div style={{padding: 24, fontFamily: 'system-ui, sans-serif'}}>
      <h2 style={{margin: '0 0 16px', fontSize: 24, fontWeight: 700}}>Features</h2>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16}}>
        {items.map(item => (
          <div key={item.title} style={{border: '1px solid #e5e7eb', borderRadius: 8, padding: 20}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8}}>
              <h3 style={{margin: 0, fontSize: 16, fontWeight: 600}}>{item.title}</h3>
              <span style={{padding: '2px 8px', borderRadius: 12, fontSize: 12, backgroundColor: '#f3f4f6'}}>{item.tag}</span>
            </div>
            <p style={{margin: 0, color: '#666'}}>{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ResponsiveCards;
