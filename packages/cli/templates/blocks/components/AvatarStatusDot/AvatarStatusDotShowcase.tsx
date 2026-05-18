// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSAvatar, XDSAvatarStatusDot} from '@xds/core/Avatar';
import {XDSHStack} from '@xds/core/Layout';

export default function AvatarStatusDotShowcase() {
  return (
    <XDSHStack gap={4} vAlign="center">
      <XDSAvatar
        name="Online User"
        size="large"
        status={<XDSAvatarStatusDot variant="positive" label="Online" />}
      />
      <XDSAvatar
        name="Away User"
        size="large"
        status={<XDSAvatarStatusDot variant="neutral" label="Away" />}
      />
      <XDSAvatar
        name="Busy User"
        size="large"
        status={<XDSAvatarStatusDot variant="negative" label="Busy" />}
      />
    </XDSHStack>
  );
}
