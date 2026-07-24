// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {Tabs, TabsList, TabsTrigger} from '@/components/ui/tabs';

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
      <h1 className="text-4xl font-bold">Simple, transparent pricing</h1>
      <Tabs value={billing} onValueChange={setBilling}>
        <TabsList>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="annual">Annual (save 20%)</TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        {tiers.map(tier => (
          <Card key={tier.name} className={tier.isPopular ? 'border-primary' : ''}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>{tier.name}</CardTitle>
                {tier.isPopular && <Badge>Popular</Badge>}
              </div>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl font-bold">
                  ${billing === 'monthly' ? tier.monthlyPrice : tier.annualPrice}
                </span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6">
                {tier.features.map(feature => (
                  <li key={feature} className="flex items-center gap-2">
                    <span className="text-green-500">&#10003;</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <Button className="w-full" variant={tier.isPopular ? 'default' : 'outline'}>
                {tier.isPopular ? 'Get started' : 'Choose plan'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default PricingTable;
