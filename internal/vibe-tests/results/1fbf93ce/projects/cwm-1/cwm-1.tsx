// Copyright (c) Meta Platforms, Inc. and affiliates.

import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {Separator} from '@/components/ui/separator';
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
        <Button variant={!isAnnual ? 'default' : 'ghost'} onClick={() => setIsAnnual(false)}>Monthly</Button>
        <Button variant={isAnnual ? 'default' : 'ghost'} onClick={() => setIsAnnual(true)}>Annual</Button>
        {isAnnual && <Badge>Save 20%</Badge>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <Card key={plan.name} className="w-[280px]">
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <div className="flex items-end gap-1">
                <span className="text-3xl font-bold">${isAnnual ? plan.annual : plan.monthly}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Separator />
              <ul className="space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="text-sm">{feature}</li>
                ))}
              </ul>
              <Button className="w-full">Choose {plan.name}</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
