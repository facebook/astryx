// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSAvatar} from '@xds/core/Avatar';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import * as stylex from '@stylexjs/stylex';

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

const groupStyles = stylex.create({
  overlap: (offset: number) => ({
    marginLeft: offset,
    borderRadius: '50%',
    border: '2px solid var(--color-background-surface, #fff)',
  }),
});

export default function AvatarGroup() {
  return (
    <XDSStack direction="vertical" gap={8}>
      <XDSStack direction="vertical" gap={3}>
        <XDSText type="supporting" color="secondary">
          Team members
        </XDSText>
        <XDSStack direction="horizontal" vAlign="center">
          {USERS.map((user, i) => (
            <XDSStack
              direction="vertical"
              key={user.name}
              {...stylex.props(groupStyles.overlap(i === 0 ? 0 : -10))}>
              <XDSAvatar src={user.src} name={user.name} size="medium" />
            </XDSStack>
          ))}
          <XDSStack
            direction="vertical"
            {...stylex.props(groupStyles.overlap(-10))}>
            <XDSAvatar name="+3" size="medium" />
          </XDSStack>
        </XDSStack>
      </XDSStack>
      <XDSStack direction="vertical" gap={3}>
        <XDSText type="supporting" color="secondary">
          Larger group
        </XDSText>
        <XDSStack direction="horizontal" vAlign="center">
          {USERS.slice(0, 3).map((user, i) => (
            <XDSStack
              direction="vertical"
              key={user.name}
              {...stylex.props(groupStyles.overlap(i === 0 ? 0 : -14))}>
              <XDSAvatar src={user.src} name={user.name} size="medium" />
            </XDSStack>
          ))}
          <XDSStack
            direction="vertical"
            {...stylex.props(groupStyles.overlap(-14))}>
            <XDSAvatar name="+8" size="medium" />
          </XDSStack>
        </XDSStack>
      </XDSStack>
    </XDSStack>
  );
}
