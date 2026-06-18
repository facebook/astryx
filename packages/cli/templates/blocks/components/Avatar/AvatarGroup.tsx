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
  {
    name: 'Gina Wilson',
    src: 'https://lookaside.facebook.com/assets/vs_datakit_profile_photos_t66173184/VS-Design-Tools-Datakit-98.jpg',
  },
  {
    name: 'Eve Park',
    src: 'https://lookaside.facebook.com/assets/vs_datakit_profile_photos_t66173184/VS-Design-Tools-Datakit-125.jpg',
  },
];

export default function AvatarGroup() {
  return (
    <Stack direction="vertical" gap={8}>
      <Stack direction="vertical" gap={3}>
        <Text type="supporting" color="secondary">
          Team members
        </Text>
        <AvatarGroup size="medium">
          {USERS.map(user => (
            <Avatar key={user.name} src={user.src} name={user.name} />
          ))}
          <AvatarGroupOverflow count={3} />
        </AvatarGroup>
      </Stack>
      <Stack direction="vertical" gap={3}>
        <Text type="supporting" color="secondary">
          Larger group
        </Text>
        <AvatarGroup size="medium">
          {USERS.slice(0, 3).map(user => (
            <Avatar key={user.name} src={user.src} name={user.name} />
          ))}
          <AvatarGroupOverflow count={8} />
        </AvatarGroup>
      </Stack>
    </Stack>
  );
}
