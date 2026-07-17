// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import {Card} from '@astryxdesign/core/Card';
import {Grid} from '@astryxdesign/core/Grid';
import {VStack, HStack} from '@astryxdesign/core/Stack';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';
import {Button} from '@astryxdesign/core/Button';
import {SegmentedControl, SegmentedControlItem} from '@astryxdesign/core/SegmentedControl';
import {Badge} from '@astryxdesign/core/Badge';
import {Divider} from '@astryxdesign/core/Divider';
import {List, ListItem} from '@astryxdesign/core/List';

const plans = [
  {name: 'Starter', monthly: 12, annual: 10, features: ['5 projects', '10GB storage', 'Email support']},
  {name: 'Pro', monthly: 29, annual: 24, features: ['Unlimited projects', '100GB storage', 'Priority support', 'API access'], popular: true},
  {name: 'Enterprise', monthly: 79, annual: 66, features: ['Unlimited everything', '1TB storage', 'Dedicated support', 'Custom integrations', 'SLA']},
];

export default function PricingTable() {
  const [billing, setBilling] = useState('monthly');

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <VStack gap={4}>
        <div className="text-center">
          <Heading level={2}>Choose your plan</Heading>
          <div className="mt-4 flex justify-center">
            <SegmentedControl value={billing} onChange={setBilling} label="Billing period">
              <SegmentedControlItem value="monthly">Monthly</SegmentedControlItem>
              <SegmentedControlItem value="annual">Annual</SegmentedControlItem>
            </SegmentedControl>
          </div>
          {billing === 'annual' && (
            <Text type="supporting" color="accent">Save up to 20% with annual billing</Text>
          )}
        </div>
        <Grid columns={{minWidth: 280, max: 3}} gap={4}>
          {plans.map((plan) => (
            <Card key={plan.name} padding={4}>
              <VStack gap={3}>
                <HStack vAlign="center" gap={2}>
                  <Heading level={3}>{plan.name}</Heading>
                  {plan.popular && <Badge variant="accent">Popular</Badge>}
                </HStack>
                <HStack vAlign="end" gap={1}>
                  <Text type="display-2">${billing === 'monthly' ? plan.monthly : plan.annual}</Text>
                  <Text type="supporting">/month</Text>
                </HStack>
                <Divider />
                <List>
                  {plan.features.map((feature) => (
                    <ListItem key={feature}>{feature}</ListItem>
                  ))}
                </List>
                <Button
                  label={plan.popular ? 'Get started' : 'Choose plan'}
                  variant={plan.popular ? 'primary' : 'secondary'}
                />
              </VStack>
            </Card>
          ))}
        </Grid>
      </VStack>
    </div>
  );
}
