// Copyright (c) Meta Platforms, Inc. and affiliates.
'use client';

import {XDSAvatar} from '@xds/core/Avatar';
import {XDSAvatarGroup, XDSAvatarGroupOverflow} from '@xds/core/AvatarGroup';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

const TEAM = [
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

export default function AvatarGroupOverflowCustomText() {
  return (
    <XDSStack direction="vertical" gap={3}>
      <XDSText type="supporting" color="secondary">
        Team members
      </XDSText>
      <XDSAvatarGroup size="medium">
        {TEAM.map(member => (
          <XDSAvatar key={member.name} src={member.src} name={member.name} />
        ))}
        <XDSAvatarGroupOverflow count={12}>12+</XDSAvatarGroupOverflow>
      </XDSAvatarGroup>
    </XDSStack>
  );
}
