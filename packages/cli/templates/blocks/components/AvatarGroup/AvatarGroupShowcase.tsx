// Copyright (c) Meta Platforms, Inc. and affiliates.
'use client';

import {XDSAvatarGroup} from '@xds/core/AvatarGroup';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

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
    <XDSStack direction="vertical" gap={8}>
      <XDSStack direction="vertical" gap={3}>
        <XDSText type="supporting" color="secondary">
          Team members
        </XDSText>
        <XDSAvatarGroup avatars={USERS} size="medium" />
      </XDSStack>
      <XDSStack direction="vertical" gap={3}>
        <XDSText type="supporting" color="secondary">
          With overflow
        </XDSText>
        <XDSAvatarGroup avatars={USERS} maxVisibleCount={3} size="medium" />
      </XDSStack>
      <XDSStack direction="vertical" gap={3}>
        <XDSText type="supporting" color="secondary">
          Server-side count
        </XDSText>
        <XDSAvatarGroup
          avatars={USERS.slice(0, 3)}
          maxVisibleCount={3}
          overflowCount={44}
          size="medium"
        />
      </XDSStack>
    </XDSStack>
  );
}
