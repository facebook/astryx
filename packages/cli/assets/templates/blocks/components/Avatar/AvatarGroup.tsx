// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Avatar} from '@astryxdesign/core/Avatar';
import {AvatarGroup, AvatarGroupOverflow} from '@astryxdesign/core/AvatarGroup';
import {Stack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';

const USERS = [
  {
    name: 'Ami Pena',
    src: 'https://lookaside.facebook.com/assets/astryx/DATA-Ami-Pena.png',
  },
  {
    name: 'Drew Young',
    src: 'https://lookaside.facebook.com/assets/astryx/DATA-Drew-Young.png',
  },
  {
    name: 'Gabriela Fernandez',
    src: 'https://lookaside.facebook.com/assets/astryx/DATA-Gabriela-Fernandez.png',
  },
  {
    name: 'Jihoo Song',
    src: 'https://lookaside.facebook.com/assets/astryx/DATA-Jihoo-Song.png',
  },
  {
    name: 'Nam Tran',
    src: 'https://lookaside.facebook.com/assets/astryx/DATA-Nam-Tran.png',
  },
];

export default function AvatarGroupBlock() {
  return (
    <Stack direction="vertical" gap={8}>
      <Stack direction="vertical" gap={3}>
        <Text type="supporting" color="secondary">
          Team members
        </Text>
        <AvatarGroup size="lg">
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
        <AvatarGroup size="lg">
          {USERS.slice(0, 3).map(user => (
            <Avatar key={user.name} src={user.src} name={user.name} />
          ))}
          <AvatarGroupOverflow count={8} />
        </AvatarGroup>
      </Stack>
    </Stack>
  );
}
