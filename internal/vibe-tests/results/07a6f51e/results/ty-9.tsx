import {Text} from '@astryxdesign/core/Text';
import {Stack} from '@astryxdesign/core/Stack';
import {Grid} from '@astryxdesign/core/Grid';
import {Badge} from '@astryxdesign/core/Badge';

interface PlanColumn {
  name: string;
  price: string;
  highlighted?: boolean;
}

const plans: PlanColumn[] = [
  {name: 'Starter', price: '$9/mo'},
  {name: 'Pro', price: '$29/mo'},
  {name: 'Enterprise', price: 'Custom', highlighted: true},
];

export default function ComparisonTableHeader() {
  return (
    <Grid columns={3} gap={3}>
      {plans.map(plan => (
        <Stack key={plan.name} gap={1} padding={3}>
          <Stack gap={0.5}>
            <Text type="label" weight="semibold">{plan.name}</Text>
            {plan.highlighted && <Badge variant="info">Most Popular</Badge>}
          </Stack>
          <Text type="display-3" weight="bold">{plan.price}</Text>
        </Stack>
      ))}
    </Grid>
  );
}
