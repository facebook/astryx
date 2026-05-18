// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSText} from '@xds/core/Text';
import {XDSStack} from '@xds/core/Stack';

const WEIGHTS = [
  {weight: 'normal' as const, label: 'Normal'},
  {weight: 'medium' as const, label: 'Medium'},
  {weight: 'semibold' as const, label: 'Semibold'},
  {weight: 'bold' as const, label: 'Bold'},
];

export default function TextWeight() {
  return (
    <XDSStack direction="vertical" gap={3}>
      {WEIGHTS.map(({weight, label}) => (
        <XDSText key={weight} type="body" weight={weight} display="block">
          {label}
        </XDSText>
      ))}
    </XDSStack>
  );
}
