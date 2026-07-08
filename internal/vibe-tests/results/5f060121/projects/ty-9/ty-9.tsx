// Copyright (c) Meta Platforms, Inc. and affiliates.

import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';

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
          className={`flex flex-col items-center gap-2 p-6 border-r last:border-r-0 ${plan.highlighted ? 'bg-surface-raised' : ''}`}
        >
          <Heading level={3}>{plan.name}</Heading>
          {plan.highlighted && <Badge label="Popular" />}
          <Text type="large">{plan.price}</Text>
        </div>
      ))}
    </div>
  );
}
