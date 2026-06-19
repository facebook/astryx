// Copyright (c) Meta Platforms, Inc. and affiliates.
'use client';

import {XDSAvatar} from '@xds/core/Avatar';
import {XDSAvatarGroup, XDSAvatarGroupOverflow} from '@xds/core/AvatarGroup';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

const REVIEWERS = [
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

export default function AvatarGroupOverflowDefault() {
  return (
    <XDSStack direction="vertical" gap={3}>
      <XDSText type="supporting" color="secondary">
        Reviewers
      </XDSText>
      <XDSAvatarGroup size="medium">
        {REVIEWERS.map(reviewer => (
          <XDSAvatar
            key={reviewer.name}
            src={reviewer.src}
            name={reviewer.name}
          />
        ))}
        <XDSAvatarGroupOverflow count={2} />
      </XDSAvatarGroup>
    </XDSStack>
  );
}
