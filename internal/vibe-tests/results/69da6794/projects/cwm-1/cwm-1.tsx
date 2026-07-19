// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import {VStack} from '@astryxdesign/core/Stack';
import {HStack} from '@astryxdesign/core/Stack';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Badge} from '@astryxdesign/core/Badge';
import {SegmentedControl, SegmentedControlItem} from '@astryxdesign/core/SegmentedControl';
import {Grid} from '@astryxdesign/core/Grid';
import {Divider} from '@astryxdesign/core/Divider';

const plans = [
  {name: 'Starter', monthly: 9, annual: 7, features: ['5 projects', '10GB storage', 'Email support']},
  {name: 'Pro', monthly: 29, annual: 24, features: ['Unlimited projects', '100GB storage', 'Priority support', 'API access']},
  {name: 'Enterprise', monthly: 99, annual: 79, features: ['Everything in Pro', 'Custom integrations', 'Dedicated account manager', 'SLA']},
];

export default function PricingTable() {
  const [billing, setBilling] = useState('monthly');

  return (
    <VStack gap={6}>
      <VStack gap={2} align="center">
        <Heading level={1}>Pricing</Heading>
        <Text color="secondary">Choose the plan that works for you</Text>
        <SegmentedControl value={billing} onChange={setBilling} label="Billing period">
          <SegmentedControlItem value="monthly" label="Monthly" />
          <SegmentedControlItem value="annual" label="Annual" />
        </SegmentedControl>
        {billing === 'annual' && <Badge variant="success" label="Save up to 20%" />}
      </VStack>
      <Grid columns={3} gap={4}>
        {plans.map(plan => (
          <Card key={plan.name}>
            <VStack gap={3}>
              <Heading level={3}>{plan.name}</Heading>
              <HStack gap={1} align="baseline">
                <Heading level={2}>${billing === 'monthly' ? plan.monthly : plan.annual}</Heading>
                <Text color="secondary">/month</Text>
              </HStack>
              <Divider />
              <VStack gap={2}>
                {plan.features.map(f => (
                  <Text key={f}>{f}</Text>
                ))}
              </VStack>
              <Button label={`Choose ${plan.name}`} variant={plan.name === 'Pro' ? 'primary' : 'secondary'} />
            </VStack>
          </Card>
        ))}
      </Grid>
    </VStack>
  );
}
