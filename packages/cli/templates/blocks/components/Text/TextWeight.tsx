// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Text} from '@xds/core/Text';
import {Stack} from '@xds/core/Stack';

const WEIGHTS = [
  {weight: 'normal' as const, label: 'Normal'},
  {weight: 'medium' as const, label: 'Medium'},
  {weight: 'semibold' as const, label: 'Semibold'},
  {weight: 'bold' as const, label: 'Bold'},
];

export default function TextWeight() {
  return (
    <Stack direction="vertical" gap={3}>
      {WEIGHTS.map(({weight, label}) => (
        <Text key={weight} type="body" weight={weight} display="block">
          {label}
        </Text>
      ))}
    </Stack>
  );
}
