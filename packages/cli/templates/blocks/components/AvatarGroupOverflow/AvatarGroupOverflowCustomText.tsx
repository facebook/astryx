// Copyright (c) Meta Platforms, Inc. and affiliates.
'use client';

import {Avatar} from '@xds/core/Avatar';
import {AvatarGroup, AvatarGroupOverflow} from '@xds/core/AvatarGroup';
import {Stack} from '@xds/core/Layout';
import {Text} from '@xds/core/Text';

const TEAM = [
  {
    name: 'Alex Daniels',
  },
  {
    name: 'Ann Smith',
  },
  {
    name: 'Carol Davis',
  },
];

export default function AvatarGroupOverflowCustomText() {
  return (
    <Stack direction="vertical" gap={3}>
      <Text type="supporting" color="secondary">
        Team members
      </Text>
      <AvatarGroup size="medium">
        {TEAM.map(member => (
          <Avatar key={member.name} name={member.name} />
        ))}
        <AvatarGroupOverflow count={12}>12+</AvatarGroupOverflow>
      </AvatarGroup>
    </Stack>
  );
}
