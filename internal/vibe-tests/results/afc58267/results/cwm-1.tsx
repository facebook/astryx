// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import {Card} from '@astryxdesign/core/Card';
import {Button} from '@astryxdesign/core/Button';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';
import {SegmentedControl} from '@astryxdesign/core/SegmentedControl';
import {Badge} from '@astryxdesign/core/Badge';
import {Icon} from '@astryxdesign/core/Icon';

interface PricingPlan {
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  features: string[];
  isPopular?: boolean;
}

const plans: PricingPlan[] = [
  {name: 'Starter', monthlyPrice: 9, annualPrice: 7, features: ['5 projects', '10GB storage', 'Email support']},
  {name: 'Pro', monthlyPrice: 29, annualPrice: 24, features: ['Unlimited projects', '100GB storage', 'Priority support', 'API access'], isPopular: true},
  {name: 'Enterprise', monthlyPrice: 99, annualPrice: 79, features: ['Unlimited everything', '1TB storage', 'Dedicated support', 'SSO', 'Audit logs']},
];

export default function PricingTable() {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');

  return (
    <div className="flex flex-col items-center gap-8 py-12">
      <div className="text-center space-y-2">
        <Heading level={1}>Simple, transparent pricing</Heading>
        <Text color="secondary">Choose the plan that fits your needs</Text>
      </div>
      <SegmentedControl
        value={billing}
        onChange={(v) => setBilling(v as 'monthly' | 'annual')}
        options={[{value: 'monthly', label: 'Monthly'}, {value: 'annual', label: 'Annual (save 20%)'}]}
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl px-4">
        {plans.map(plan => {
          const price = billing === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
          return (
            <Card key={plan.name}>
              <div className="p-6 flex flex-col gap-4">
                {plan.isPopular && <Badge variant="info">Most Popular</Badge>}
                <Heading level={3}>{plan.name}</Heading>
                <div className="flex items-baseline gap-1">
                  <Text size="3xl" weight="bold">${price}</Text>
                  <Text color="secondary">/mo</Text>
                </div>
                <hr className="my-2" />
                <div className="flex flex-col gap-2">
                  {plan.features.map(feature => (
                    <div key={feature} className="flex items-center gap-2">
                      <Icon name="check" size="sm" />
                      <Text>{feature}</Text>
                    </div>
                  ))}
                </div>
                <Button label={plan.isPopular ? 'Get Started' : 'Choose Plan'} variant={plan.isPopular ? 'primary' : 'secondary'} />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
