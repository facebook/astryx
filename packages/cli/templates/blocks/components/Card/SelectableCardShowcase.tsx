// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {SelectableCard} from '@xds/core/SelectableCard';
import {Stack} from '@xds/core/Layout';
import {Text, Heading} from '@xds/core/Text';

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
    <Stack direction="horizontal" gap={3}>
      {plans.map(plan => (
        <SelectableCard
          key={plan.id}
          label={plan.name}
          isSelected={selected === plan.id}
          onChange={() => setSelected(plan.id)}
          width={180}>
          <Stack direction="vertical" gap={1}>
            <Heading level={4}>{plan.name}</Heading>
            <Text type="large" weight="bold">
              {plan.price}
            </Text>
            <Text type="supporting" color="secondary">
              {plan.desc}
            </Text>
          </Stack>
        </SelectableCard>
      ))}
    </Stack>
  );
}
