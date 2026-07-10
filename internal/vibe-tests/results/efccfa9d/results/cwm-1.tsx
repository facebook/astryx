// Copyright (c) Meta Platforms, Inc. and affiliates.

import {Card} from '@astryxdesign/core/Card';
import {Button} from '@astryxdesign/core/Button';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';
import {VStack} from '@astryxdesign/core/VStack';
import {HStack} from '@astryxdesign/core/HStack';
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
    <VStack gap={4} align="center">
      <HStack gap={2}>
        <Button
          label="Monthly"
          variant={!isAnnual ? 'primary' : 'ghost'}
          onClick={() => setIsAnnual(false)}
        />
        <Button
          label="Annual"
          variant={isAnnual ? 'primary' : 'ghost'}
          onClick={() => setIsAnnual(true)}
        />
        {isAnnual && <Badge label="Save 20%" />}
      </HStack>
      <HStack gap={4}>
        {plans.map((plan) => (
          <Card key={plan.name} width={280} padding={4}>
            <VStack gap={3}>
              <Heading level={3}>{plan.name}</Heading>
              <HStack gap={1} align="end">
                <Heading level={2}>${isAnnual ? plan.annual : plan.monthly}</Heading>
                <Text color="secondary">/month</Text>
              </HStack>
              <Divider />
              <VStack gap={2}>
                {plan.features.map((feature) => (
                  <Text key={feature}>{feature}</Text>
                ))}
              </VStack>
              <Button label={`Choose ${plan.name}`} variant="primary" />
            </VStack>
          </Card>
        ))}
      </HStack>
    </VStack>
  );
}
