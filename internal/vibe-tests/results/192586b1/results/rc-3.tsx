// Copyright (c) Meta Platforms, Inc. and affiliates.

const cards = [
  {title: 'Design', description: 'Create beautiful interfaces with our component library.'},
  {title: 'Develop', description: 'Build fast with typed props and tree-shaking.'},
  {title: 'Deploy', description: 'Ship confidently with tested, accessible components.'},
];

export default function ResponsiveCards() {
  return (
    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16}}>
      {cards.map(card => (
        <div key={card.title} style={{padding: 24, border: '1px solid #e5e7eb', borderRadius: 8}}>
          <h3 style={{margin: '0 0 8px', fontSize: 18, fontWeight: 600}}>{card.title}</h3>
          <p style={{margin: 0, color: '#666', fontSize: 14}}>{card.description}</p>
        </div>
      ))}
    </div>
  );
}
