// Copyright (c) Meta Platforms, Inc. and affiliates.

import {Card} from '@astryxdesign/core/Card';
import {Button} from '@astryxdesign/core/Button';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';
import {Divider} from '@astryxdesign/core/Divider';
import {Badge} from '@astryxdesign/core/Badge';
import {useState} from 'react';

const plans = [
  {name: 'Starter', monthly: 9, annual: 7, features: ['5 projects', '10GB storage', 'Email support']},
  {name: 'Pro', monthly: 29, annual: 23, features: ['Unlimited projects', '100GB storage', 'Priority support', 'API access']},
  {name: 'Enterprise', monthly: 99, annual: 79, features: ['Everything in Pro', '1TB storage', 'Dedicated account manager', 'SSO']},
];

export default function PricingTable() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <div className="flex flex-col items-center gap-6 p-8">
      <div className="flex items-center gap-2">
        <Button label="Monthly" variant={!isAnnual ? 'primary' : 'ghost'} onClick={() => setIsAnnual(false)} />
        <Button label="Annual" variant={isAnnual ? 'primary' : 'ghost'} onClick={() => setIsAnnual(true)} />
        {isAnnual && <Badge label="Save 20%" />}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <Card key={plan.name} padding={4}>
            <div className="flex flex-col gap-3">
              <Heading level={3}>{plan.name}</Heading>
              <div className="flex items-end gap-1">
                <Heading level={2}>${isAnnual ? plan.annual : plan.monthly}</Heading>
                <Text color="secondary">/month</Text>
              </div>
              <Divider />
              <div className="flex flex-col gap-2">
                {plan.features.map((feature) => (
                  <Text key={feature}>{feature}</Text>
                ))}
              </div>
              <Button label={`Choose ${plan.name}`} variant="primary" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
