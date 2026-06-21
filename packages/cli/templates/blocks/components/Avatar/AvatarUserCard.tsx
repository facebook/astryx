// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Avatar, AvatarStatusDot} from '@xds/core/Avatar';
import {Stack} from '@xds/core/Layout';
import {Text} from '@xds/core/Text';

const USERS = [
  {
    name: 'Alex Daniels',
    role: 'Engineering Lead',
    variant: 'success' as const,
  },
  {
    name: 'Ann Smith',
    role: 'Product Designer',
    variant: 'neutral' as const,
  },
  {
    name: 'Carol Davis',
    role: 'Engineering Manager',
    variant: 'error' as const,
  },
];

export default function AvatarUserCard() {
  return (
    <Stack direction="vertical" gap={4}>
      {USERS.map(user => (
        <Stack key={user.name} direction="horizontal" gap={3} vAlign="center">
          <Avatar
            name={user.name}
            size="medium"
            status={
              <AvatarStatusDot variant={user.variant} label={user.variant} />
            }
          />
          <Stack direction="vertical" gap={0}>
            <Text type="body" weight="bold">
              {user.name}
            </Text>
            <Text type="supporting" color="secondary">
              {user.role}
            </Text>
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
}
