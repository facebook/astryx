// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSAvatar, XDSAvatarStatusDot} from '@xds/core/Avatar';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

const USERS = [
  {
    name: 'Alex Daniels',
    role: 'Engineering Lead',
    variant: 'success' as const,
    src: 'https://lookaside.facebook.com/assets/vs_datakit_profile_photos_t66173184/VS-Design-Tools-Datakit-05.jpg',
  },
  {
    name: 'Ann Smith',
    role: 'Product Designer',
    variant: 'neutral' as const,
    src: 'https://lookaside.facebook.com/assets/vs_datakit_profile_photos_t66173184/VS-Design-Tools-Datakit-30.jpg',
  },
  {
    name: 'Carol Davis',
    role: 'Engineering Manager',
    variant: 'error' as const,
    src: 'https://lookaside.facebook.com/assets/vs_datakit_profile_photos_t66173184/VS-Design-Tools-Datakit-60.jpg',
  },
];

export default function AvatarUserCard() {
  return (
    <XDSStack direction="vertical" gap={4}>
      {USERS.map(user => (
        <XDSStack
          key={user.name}
          direction="horizontal"
          gap={3}
          vAlign="center">
          <XDSAvatar
            src={user.src}
            name={user.name}
            size="medium"
            status={
              <XDSAvatarStatusDot variant={user.variant} label={user.variant} />
            }
          />
          <XDSStack direction="vertical" gap={0}>
            <XDSText type="body" weight="bold">
              {user.name}
            </XDSText>
            <XDSText type="supporting" color="secondary">
              {user.role}
            </XDSText>
          </XDSStack>
        </XDSStack>
      ))}
    </XDSStack>
  );
}
