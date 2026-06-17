// Copyright (c) Meta Platforms, Inc. and affiliates.
'use client';

import {Avatar} from '@xds/core/Avatar';
import {AvatarGroup, AvatarGroupOverflow} from '@xds/core/AvatarGroup';
import {Stack} from '@xds/core/Layout';
import {Text} from '@xds/core/Text';

const USERS = [
  {
    name: 'Alex Daniels',
    src: 'https://lookaside.facebook.com/assets/vs_datakit_profile_photos_t66173184/VS-Design-Tools-Datakit-05.jpg',
  },
  {
    name: 'Ann Smith',
    src: 'https://lookaside.facebook.com/assets/vs_datakit_profile_photos_t66173184/VS-Design-Tools-Datakit-30.jpg',
  },
  {
    name: 'Carol Davis',
    src: 'https://lookaside.facebook.com/assets/vs_datakit_profile_photos_t66173184/VS-Design-Tools-Datakit-60.jpg',
  },
];

export default function AvatarGroupOverflowShowcase() {
  return (
    <Stack direction="vertical" gap={8}>
      <Stack direction="vertical" gap={3}>
        <Text type="supporting" color="secondary">
          Default overflow
        </Text>
        <AvatarGroup size="medium">
          {USERS.map(user => (
            <Avatar key={user.name} src={user.src} name={user.name} />
          ))}
          <AvatarGroupOverflow count={5} />
        </AvatarGroup>
      </Stack>
      <Stack direction="vertical" gap={3}>
        <Text type="supporting" color="secondary">
          Custom count text
        </Text>
        <AvatarGroup size="medium">
          {USERS.slice(0, 2).map(user => (
            <Avatar key={user.name} src={user.src} name={user.name} />
          ))}
          <AvatarGroupOverflow count={12}>12+</AvatarGroupOverflow>
        </AvatarGroup>
      </Stack>
    </Stack>
  );
}
