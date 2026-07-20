import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';

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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map(item => (
        <Card key={item.title}>
          <CardHeader><CardTitle className="text-base">{item.title}</CardTitle></CardHeader>
          <CardContent><p className="text-sm text-muted-foreground">{item.description}</p></CardContent>
        </Card>
      ))}
    </div>
  );
}
