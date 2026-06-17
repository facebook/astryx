// Copyright (c) Meta Platforms, Inc. and affiliates.
'use client';

import {AvatarGroup, AvatarGroupOverflow} from '@xds/core/AvatarGroup';
import {Avatar} from '@xds/core/Avatar';
import {Stack} from '@xds/core/Layout';
import {Text} from '@xds/core/Text';

const USERS = [
  {
    name: 'Alex Daniels',
    src: 'https://lookaside.facebook.com/assets/vs_datakit_profile_photos_t66173184/VS-Design-Tools-Datakit-05.jpg',
    key: 'alex',
  },
  {
    name: 'Ann Smith',
    src: 'https://lookaside.facebook.com/assets/vs_datakit_profile_photos_t66173184/VS-Design-Tools-Datakit-30.jpg',
    key: 'ann',
  },
  {
    name: 'Carol Davis',
    src: 'https://lookaside.facebook.com/assets/vs_datakit_profile_photos_t66173184/VS-Design-Tools-Datakit-60.jpg',
    key: 'carol',
  },
  {
    name: 'Gina Wilson',
    src: 'https://lookaside.facebook.com/assets/vs_datakit_profile_photos_t66173184/VS-Design-Tools-Datakit-98.jpg',
    key: 'gina',
  },
  {
    name: 'Eve Park',
    src: 'https://lookaside.facebook.com/assets/vs_datakit_profile_photos_t66173184/VS-Design-Tools-Datakit-125.jpg',
    key: 'eve',
  },
];

export default function AvatarGroupShowcase() {
  return (
    <Stack direction="vertical" gap={8}>
      <Stack direction="vertical" gap={3}>
        <Text type="supporting" color="secondary">
          Team members
        </Text>
        <AvatarGroup size="medium">
          {USERS.map(u => (
            <Avatar key={u.key} src={u.src} name={u.name} />
          ))}
        </AvatarGroup>
      </Stack>
      <Stack direction="vertical" gap={3}>
        <Text type="supporting" color="secondary">
          With overflow
        </Text>
        <AvatarGroup size="medium">
          {USERS.slice(0, 3).map(u => (
            <Avatar key={u.key} src={u.src} name={u.name} />
          ))}
          <AvatarGroupOverflow count={USERS.length - 3} />
        </AvatarGroup>
      </Stack>
    </Stack>
  );
}
