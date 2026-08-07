// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Avatar, AvatarStatusDot} from '@astryxdesign/core/Avatar';
import {Stack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';

const USERS = [
  {
    name: 'Itai Jordaan',
    src: 'https://lookaside.facebook.com/assets/astryx/DATA-Itai-Jordaan.png',
    role: 'Engineering Lead',
    variant: 'success' as const,
  },
  {
    name: 'Margot Schroder',
    src: 'https://lookaside.facebook.com/assets/astryx/DATA-Margot-Schroder.png',
    role: 'Product Designer',
    variant: 'neutral' as const,
  },
  {
    name: 'Daniela Gimenez',
    src: 'https://lookaside.facebook.com/assets/astryx/DATA-Daniela-Gimenez.png',
    role: 'Engineering Manager',
    variant: 'error' as const,
  },
];

export default function AvatarUserCard() {
  return (
    <Stack direction="vertical" gap={4}>
      {USERS.map(user => (
        <Stack key={user.name} direction="horizontal" gap={3} vAlign="center">
          <Avatar
            src={user.src}
            name={user.name}
            size="lg"
            status={
              <AvatarStatusDot variant={user.variant} label={user.variant} />
            }
          />
          <Stack direction="vertical" gap={0}>
            <Text type="body" weight="bold">
              {user.name}
            </Text>
            <Text type="supporting" color="secondary">
              {user.role}
            </Text>
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
}
