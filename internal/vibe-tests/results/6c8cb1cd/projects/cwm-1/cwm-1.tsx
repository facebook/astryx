// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import {Card} from '@astryxdesign/core/Card';
import {Stack} from '@astryxdesign/core/Stack';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Button} from '@astryxdesign/core/Button';
import {SegmentedControl} from '@astryxdesign/core/SegmentedControl';
import {Badge} from '@astryxdesign/core/Badge';

interface PricingTier {
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  features: string[];
  isPopular?: boolean;
}

const tiers: PricingTier[] = [
  {name: 'Starter', monthlyPrice: 12, annualPrice: 9, features: ['5 projects', '1 GB storage', 'Email support']},
  {name: 'Pro', monthlyPrice: 29, annualPrice: 24, features: ['Unlimited projects', '10 GB storage', 'Priority support', 'Custom domains'], isPopular: true},
  {name: 'Enterprise', monthlyPrice: 79, annualPrice: 65, features: ['Unlimited everything', '100 GB storage', '24/7 phone support', 'SSO', 'Audit logs']},
];

export function PricingTable() {
  const [billing, setBilling] = useState('monthly');

  return (
    <Stack gap={4} align="center" padding={6}>
      <Heading level={1}>Simple, transparent pricing</Heading>
      <SegmentedControl
        value={billing}
        onChange={setBilling}
        label="Billing period"
        items={[
          {value: 'monthly', label: 'Monthly'},
          {value: 'annual', label: 'Annual (save 20%)'},
        ]}
      />
      <Stack direction="row" gap={3} align="stretch">
        {tiers.map(tier => (
          <Card key={tier.name} padding={4}>
            <Stack gap={3}>
              <Stack direction="row" align="center" gap={2}>
                <Heading level={3}>{tier.name}</Heading>
                {tier.isPopular && <Badge label="Popular" />}
              </Stack>
              <Stack direction="row" align="baseline" gap={1}>
                <Heading level={2}>
                  ${billing === 'monthly' ? tier.monthlyPrice : tier.annualPrice}
                </Heading>
                <Text color="secondary">/month</Text>
              </Stack>
              <Stack gap={2}>
                {tier.features.map(feature => (
                  <Text key={feature}>{feature}</Text>
                ))}
              </Stack>
              <Button
                label={tier.isPopular ? 'Get started' : 'Choose plan'}
                variant={tier.isPopular ? 'primary' : 'secondary'}
                width="100%"
              />
            </Stack>
          </Card>
        ))}
      </Stack>
    </Stack>
  );
}

export default PricingTable;
