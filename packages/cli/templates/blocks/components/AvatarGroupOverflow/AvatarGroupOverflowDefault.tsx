// Copyright (c) Meta Platforms, Inc. and affiliates.
'use client';

import {Avatar} from '@xds/core/Avatar';
import {AvatarGroup, AvatarGroupOverflow} from '@xds/core/AvatarGroup';
import {Stack} from '@xds/core/Layout';
import {Text} from '@xds/core/Text';

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
    <Stack direction="vertical" gap={3}>
      <Text type="supporting" color="secondary">
        Reviewers
      </Text>
      <AvatarGroup size="medium">
        {REVIEWERS.map(reviewer => (
          <Avatar
            key={reviewer.name}
            src={reviewer.src}
            name={reviewer.name}
          />
        ))}
        <AvatarGroupOverflow count={2} />
      </AvatarGroup>
    </Stack>
  );
}
