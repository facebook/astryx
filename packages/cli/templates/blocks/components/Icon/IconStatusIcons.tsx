// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Icon} from '@xds/core/Icon';
import {VStack, HStack} from '@xds/core/Layout';
import {Text} from '@xds/core/Text';

const statuses = [
  {icon: 'success' as const, color: 'success' as const, label: 'Deployed successfully'},
  {icon: 'warning' as const, color: 'warning' as const, label: 'Build has warnings'},
  {icon: 'error' as const, color: 'error' as const, label: 'Pipeline failed'},
  {icon: 'info' as const, color: 'accent' as const, label: 'New version available'},
] as const;

export default function IconStatusIcons() {
  return (
    <VStack gap={3}>
      {statuses.map((status) => (
        <HStack key={status.label} gap={2} vAlign="center">
          <Icon icon={status.icon} color={status.color} size="sm" />
          <Text type="body">{status.label}</Text>
        </HStack>
      ))}
    </VStack>
  );
}
