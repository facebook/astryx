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
];

export default function AvatarGroupOverflowShowcase() {
  return (
    <XDSStack direction="vertical" gap={8}>
      <XDSStack direction="vertical" gap={3}>
        <XDSText type="supporting" color="secondary">
          Default overflow
        </XDSText>
        <XDSAvatarGroup size="medium">
          {USERS.map(user => (
            <XDSAvatar key={user.name} src={user.src} name={user.name} />
          ))}
          <XDSAvatarGroupOverflow count={5} />
        </XDSAvatarGroup>
      </XDSStack>
      <XDSStack direction="vertical" gap={3}>
        <XDSText type="supporting" color="secondary">
          Custom count text
        </XDSText>
        <XDSAvatarGroup size="medium">
          {USERS.slice(0, 2).map(user => (
            <XDSAvatar key={user.name} src={user.src} name={user.name} />
          ))}
          <XDSAvatarGroupOverflow count={12}>12+</XDSAvatarGroupOverflow>
        </XDSAvatarGroup>
      </XDSStack>
    </XDSStack>
  );
}
