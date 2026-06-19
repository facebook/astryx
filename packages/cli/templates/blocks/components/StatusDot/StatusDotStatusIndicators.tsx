// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {StatusDot} from '@xds/core/StatusDot';
import {VStack, HStack} from '@xds/core/Layout';
import {Text} from '@xds/core/Text';

const statuses = [
  {variant: 'success', label: 'Online'},
  {variant: 'warning', label: 'Away'},
  {variant: 'error', label: 'Offline'},
  {variant: 'neutral', label: 'Unknown'},
] as const;

export default function StatusDotStatusIndicators() {
  return (
    <VStack gap={2}>
      {statuses.map(({variant, label}) => (
        <HStack key={variant} gap={2} vAlign="center">
          <StatusDot variant={variant} label={label} />
          <Text type="body">{label}</Text>
        </HStack>
      ))}
    </VStack>
  );
}
