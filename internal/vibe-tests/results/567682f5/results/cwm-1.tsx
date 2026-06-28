// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import {Card, CardContent, CardHeader, CardTitle, CardDescription} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {Tabs, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {Check} from 'lucide-react';

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
        <h1 className="text-3xl font-bold">Simple, transparent pricing</h1>
        <p className="text-muted-foreground">Choose the plan that fits your needs</p>
      </div>
      <Tabs value={billing} onValueChange={(v) => setBilling(v as 'monthly' | 'annual')}>
        <TabsList>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="annual">Annual (save 20%)</TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl px-4">
        {plans.map(plan => {
          const price = billing === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
          return (
            <Card key={plan.name} className={plan.isPopular ? 'border-primary shadow-lg' : ''}>
              <CardHeader>
                {plan.isPopular && <Badge className="w-fit mb-2">Most Popular</Badge>}
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>
                  <span className="text-3xl font-bold text-foreground">${price}</span>
                  <span className="text-muted-foreground">/mo</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map(feature => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant={plan.isPopular ? 'default' : 'outline'}>
                  {plan.isPopular ? 'Get Started' : 'Choose Plan'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
