// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import {Card} from '@astryxdesign/core/Card';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Button} from '@astryxdesign/core/Button';
import {SegmentedControl} from '@astryxdesign/core/SegmentedControl';
import {Badge} from '@astryxdesign/core/Badge';
import {Stack} from '@astryxdesign/core/Stack';

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
    <div className="flex flex-col items-center gap-8 py-12 px-4">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        {tiers.map(tier => (
          <Card key={tier.name} padding={4}>
            <Stack gap={3}>
              <div className="flex items-center gap-2">
                <Heading level={3}>{tier.name}</Heading>
                {tier.isPopular && <Badge label="Popular" />}
              </div>
              <div className="flex items-baseline gap-1">
                <Heading level={2}>
                  ${billing === 'monthly' ? tier.monthlyPrice : tier.annualPrice}
                </Heading>
                <Text color="secondary">/month</Text>
              </div>
              <ul className="space-y-2">
                {tier.features.map(feature => (
                  <li key={feature} className="flex items-center gap-2">
                    <span className="text-green-500">&#10003;</span>
                    <Text>{feature}</Text>
                  </li>
                ))}
              </ul>
              <Button
                label={tier.isPopular ? 'Get started' : 'Choose plan'}
                variant={tier.isPopular ? 'primary' : 'secondary'}
                width="100%"
              />
            </Stack>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default PricingTable;
