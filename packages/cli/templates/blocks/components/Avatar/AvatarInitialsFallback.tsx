'use client';

import {XDSAvatar} from '@xds/core/Avatar';
import {XDSStack} from '@xds/core/Layout';

export default function AvatarInitialsFallback() {
  return (
    <XDSStack direction="horizontal" gap={4} vAlign="center">
      <XDSAvatar name="John Doe" size="medium" />
      <XDSAvatar name="Alice" size="medium" />
      <XDSAvatar name="Bob Smith Johnson" size="medium" />
      <XDSAvatar name="Dr. Sarah Connor" size="medium" />
    </XDSStack>
  );
}
