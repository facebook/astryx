// Copyright (c) Meta Platforms, Inc. and affiliates.

import {Badge} from '@/components/ui/badge';

const plans = [
  {name: 'Starter', price: '$9/mo', highlighted: false},
  {name: 'Pro', price: '$29/mo', highlighted: false},
  {name: 'Enterprise', price: 'Custom', highlighted: true},
];

export default function ComparisonHeader() {
  return (
    <div className="grid grid-cols-3">
      {plans.map((plan) => (
        <div
          key={plan.name}
          className={`flex flex-col items-center gap-2 p-6 border-r last:border-r-0 ${plan.highlighted ? 'bg-muted' : ''}`}
        >
          <h3 className="text-lg font-semibold">{plan.name}</h3>
          {plan.highlighted && <Badge>Popular</Badge>}
          <span className="text-2xl font-bold">{plan.price}</span>
        </div>
      ))}
    </div>
  );
}
