const items = [
  {title: 'Analytics', description: 'Track user engagement and conversion metrics'},
  {title: 'Settings', description: 'Configure your workspace preferences'},
  {title: 'Team', description: 'Manage team members and permissions'},
  {title: 'Billing', description: 'View invoices and manage subscription'},
  {title: 'Integrations', description: 'Connect third-party services'},
  {title: 'Security', description: 'Configure authentication and access controls'},
];

export default function ResponsiveCards() {
  return (
    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16}}>
      {items.map(item => (
        <div key={item.title} style={{border: '1px solid #e0e0e0', borderRadius: 8, padding: 16}}>
          <h3 style={{margin: '0 0 8px', fontSize: 16, fontWeight: 600}}>{item.title}</h3>
          <p style={{margin: 0, color: '#666', fontSize: 14}}>{item.description}</p>
        </div>
      ))}
    </div>
  );
}
