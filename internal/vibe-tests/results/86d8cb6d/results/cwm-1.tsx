// Copyright (c) Meta Platforms, Inc. and affiliates.

import { Card } from '@astryxdesign/core/Card';
import { Button } from '@astryxdesign/core/Button';
import { Text } from '@astryxdesign/core/Text';
import { Stack } from '@astryxdesign/core/Stack';
import { Grid } from '@astryxdesign/core/Grid';
import { SegmentedControl } from '@astryxdesign/core/SegmentedControl';
import { Badge } from '@astryxdesign/core/Badge';
import { Divider } from '@astryxdesign/core/Divider';
import { useState } from 'react';

const plans = [
  { name: 'Starter', monthly: 12, annual: 10, features: ['5 projects', '10GB storage', 'Email support'] },
  { name: 'Pro', monthly: 24, annual: 20, features: ['Unlimited projects', '100GB storage', 'Priority support', 'API access'] },
  { name: 'Enterprise', monthly: 48, annual: 40, features: ['Everything in Pro', '1TB storage', 'Dedicated support', 'Custom integrations', 'SLA'] },
];

export default function PricingTable() {
  const [billing, setBilling] = useState<string>('monthly');

  return (
    <Stack gap={4} hAlign="center">
      <Stack gap={2} hAlign="center">
        <Text type="display-3" weight="bold">Simple pricing</Text>
        <SegmentedControl
          value={billing}
          onChange={setBilling}
          items={[
            { value: 'monthly', label: 'Monthly' },
            { value: 'annual', label: 'Annual' },
          ]}
        />
        {billing === 'annual' && <Badge variant="success">Save 20%</Badge>}
      </Stack>
      <Grid columns={3}>
        {plans.map((plan) => (
          <Card key={plan.name} padding={4}>
            <Stack gap={3}>
              <Text type="label" weight="semibold">{plan.name}</Text>
              <Stack gap={0.5}>
                <Text type="display-3" weight="bold">
                  ${billing === 'monthly' ? plan.monthly : plan.annual}
                </Text>
                <Text color="secondary">per month</Text>
              </Stack>
              <Divider />
              <Stack gap={1}>
                {plan.features.map((feature) => (
                  <Text key={feature} color="secondary">{feature}</Text>
                ))}
              </Stack>
              <Button variant={plan.name === 'Pro' ? 'primary' : 'secondary'}>
                Get started
              </Button>
            </Stack>
          </Card>
        ))}
      </Grid>
    </Stack>
  );
}
