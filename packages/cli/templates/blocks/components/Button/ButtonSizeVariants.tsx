// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Button} from '@xds/core/Button';
import {Stack} from '@xds/core/Layout';
import {Text} from '@xds/core/Text';

const SIZES = [
  {size: 'sm' as const, label: 'Small'},
  {size: 'md' as const, label: 'Medium'},
  {size: 'lg' as const, label: 'Large'},
];

export default function ButtonSizeVariants() {
  return (
    <Stack direction="vertical" gap={4}>
      <Stack direction="vertical" gap={1}>
        <Text type="supporting" color="secondary">
          Primary
        </Text>
        <Stack direction="horizontal" gap={3} vAlign="center">
          {SIZES.map(({size, label}) => (
            <Button key={size} label={label} variant="primary" size={size} />
          ))}
        </Stack>
      </Stack>
      <Stack direction="vertical" gap={1}>
        <Text type="supporting" color="secondary">
          Secondary
        </Text>
        <Stack direction="horizontal" gap={3} vAlign="center">
          {SIZES.map(({size, label}) => (
            <Button
              key={size}
              label={label}
              variant="secondary"
              size={size}
            />
          ))}
        </Stack>
      </Stack>
    </Stack>
  );
}
