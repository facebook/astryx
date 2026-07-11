// Copyright (c) Meta Platforms, Inc. and affiliates.

import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from './components/ui/tabs';
import { useState } from 'react';

const plans = [
  { name: 'Starter', monthly: 12, annual: 10, features: ['5 projects', '10GB storage', 'Email support'] },
  { name: 'Pro', monthly: 24, annual: 20, features: ['Unlimited projects', '100GB storage', 'Priority support', 'API access'] },
  { name: 'Enterprise', monthly: 48, annual: 40, features: ['Everything in Pro', '1TB storage', 'Dedicated support', 'Custom integrations', 'SLA'] },
];

export default function PricingTable() {
  const [billing, setBilling] = useState('monthly');

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">Simple pricing</h2>
        <Tabs value={billing} onValueChange={setBilling}>
          <TabsList>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="annual">Annual</TabsTrigger>
          </TabsList>
        </Tabs>
        {billing === 'annual' && <Badge variant="secondary">Save 20%</Badge>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.name}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <div className="text-3xl font-bold">${billing === 'monthly' ? plan.monthly : plan.annual}/mo</div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="text-sm text-muted-foreground">{f}</li>
                ))}
              </ul>
              <Button className="w-full" variant={plan.name === 'Pro' ? 'default' : 'outline'}>
                Get started
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
