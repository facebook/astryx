import {Card} from '@astryxdesign/core/Card';
import {Grid} from '@astryxdesign/core/Grid';
import {Text} from '@astryxdesign/core/Text';
import {Stack} from '@astryxdesign/core/Stack';

interface CardItem {
  title: string;
  description: string;
}

const items: CardItem[] = [
  {title: 'Analytics', description: 'Track user engagement and conversion metrics'},
  {title: 'Settings', description: 'Configure your workspace preferences'},
  {title: 'Team', description: 'Manage team members and permissions'},
  {title: 'Billing', description: 'View invoices and manage subscription'},
  {title: 'Integrations', description: 'Connect third-party services'},
  {title: 'Security', description: 'Configure authentication and access controls'},
];

export default function ResponsiveCards() {
  return (
    <Grid columns={{minWidth: 280, max: 3}} gap={3}>
      {items.map(item => (
        <Card key={item.title} padding={4}>
          <Stack gap={2}>
            <Text type="label" weight="semibold">{item.title}</Text>
            <Text color="secondary">{item.description}</Text>
          </Stack>
        </Card>
      ))}
    </Grid>
  );
}
