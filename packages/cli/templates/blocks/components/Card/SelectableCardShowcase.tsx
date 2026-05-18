// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {XDSSelectableCard} from '@xds/core/SelectableCard';
import {XDSStack} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';

const plans = [
  {id: 'basic', name: 'Basic', price: '$9/mo', desc: 'For individuals'},
  {id: 'pro', name: 'Pro', price: '$29/mo', desc: 'For small teams'},
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '$99/mo',
    desc: 'For organizations',
  },
];

export default function SelectableCardShowcase() {
  const [selected, setSelected] = useState<string | null>('pro');

  return (
    <XDSStack direction="horizontal" gap={3}>
      {plans.map(plan => (
        <XDSSelectableCard
          key={plan.id}
          label={plan.name}
          isSelected={selected === plan.id}
          onChange={() => setSelected(plan.id)}
          width={180}>
          <XDSStack direction="vertical" gap={1}>
            <XDSHeading level={4}>{plan.name}</XDSHeading>
            <XDSText type="large" weight="bold">
              {plan.price}
            </XDSText>
            <XDSText type="supporting" color="secondary">
              {plan.desc}
            </XDSText>
          </XDSStack>
        </XDSSelectableCard>
      ))}
    </XDSStack>
  );
}
