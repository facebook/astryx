// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import {Card} from '@astryxdesign/core/Card';
import {Button} from '@astryxdesign/core/Button';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';
import {VStack} from '@astryxdesign/core/VStack';
import {HStack} from '@astryxdesign/core/HStack';
import {SegmentedControl} from '@astryxdesign/core/SegmentedControl';
import {Badge} from '@astryxdesign/core/Badge';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';

interface PricingPlan {
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  features: string[];
  isPopular?: boolean;
}

const plans: PricingPlan[] = [
  {
    name: 'Starter',
    monthlyPrice: 9,
    annualPrice: 7,
    features: ['5 projects', '10GB storage', 'Email support'],
  },
  {
    name: 'Pro',
    monthlyPrice: 29,
    annualPrice: 24,
    features: ['Unlimited projects', '100GB storage', 'Priority support', 'API access'],
    isPopular: true,
  },
  {
    name: 'Enterprise',
    monthlyPrice: 99,
    annualPrice: 79,
    features: ['Unlimited everything', '1TB storage', 'Dedicated support', 'SSO', 'Audit logs'],
  },
];

export default function PricingTable() {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');

  return (
    <VStack gap="xl" align="center">
      <VStack gap="sm" align="center">
        <Heading level={1}>Simple, transparent pricing</Heading>
        <Text color="secondary">Choose the plan that fits your needs</Text>
      </VStack>
      <SegmentedControl
        value={billing}
        onChange={(v) => setBilling(v as 'monthly' | 'annual')}
        options={[
          {value: 'monthly', label: 'Monthly'},
          {value: 'annual', label: 'Annual (save 20%)'},
        ]}
      />
      <HStack gap="lg" wrap="wrap" justify="center">
        {plans.map(plan => {
          const price = billing === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
          return (
            <Card key={plan.name} style={{width: 300, position: 'relative'}}>
              <VStack gap="md" style={{padding: 'var(--xds-spacing-lg)'}}>
                {plan.isPopular && (
                  <Badge variant="info">Most Popular</Badge>
                )}
                <Heading level={3}>{plan.name}</Heading>
                <HStack align="baseline" gap="xs">
                  <Text size="3xl" weight="bold">${price}</Text>
                  <Text color="secondary">/mo</Text>
                </HStack>
                {billing === 'annual' && (
                  <Text size="sm" color="secondary">
                    Billed annually (${price * 12}/yr)
                  </Text>
                )}
                <Divider />
                <VStack gap="sm">
                  {plan.features.map(feature => (
                    <HStack key={feature} gap="sm" align="center">
                      <Icon name="check" size="sm" />
                      <Text>{feature}</Text>
                    </HStack>
                  ))}
                </VStack>
                <Button
                  label={plan.isPopular ? 'Get Started' : 'Choose Plan'}
                  variant={plan.isPopular ? 'primary' : 'secondary'}
                />
              </VStack>
            </Card>
          );
        })}
      </HStack>
    </VStack>
  );
}
