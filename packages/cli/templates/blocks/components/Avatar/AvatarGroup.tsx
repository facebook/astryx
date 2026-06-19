// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSAvatar} from '@xds/core/Avatar';
import {XDSAvatarGroup, XDSAvatarGroupOverflow} from '@xds/core/AvatarGroup';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

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
    <XDSStack direction="vertical" gap={8}>
      <XDSStack direction="vertical" gap={3}>
        <XDSText type="supporting" color="secondary">
          Team members
        </XDSText>
        <XDSAvatarGroup size="medium">
          {USERS.map(user => (
            <XDSAvatar key={user.name} src={user.src} name={user.name} />
          ))}
          <XDSAvatarGroupOverflow count={3} />
        </XDSAvatarGroup>
      </XDSStack>
      <XDSStack direction="vertical" gap={3}>
        <XDSText type="supporting" color="secondary">
          Larger group
        </XDSText>
        <XDSAvatarGroup size="medium">
          {USERS.slice(0, 3).map(user => (
            <XDSAvatar key={user.name} src={user.src} name={user.name} />
          ))}
          <XDSAvatarGroupOverflow count={8} />
        </XDSAvatarGroup>
      </XDSStack>
    </XDSStack>
  );
}
