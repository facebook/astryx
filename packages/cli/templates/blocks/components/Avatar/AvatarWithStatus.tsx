// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Avatar, AvatarStatusDot} from '@xds/core/Avatar';
import {Stack} from '@xds/core/Layout';

export default function AvatarWithStatus() {
  return (
    <Stack direction="horizontal" gap={4} vAlign="center">
      <Avatar
        name="Alex Daniels"
        size="large"
        status={<AvatarStatusDot variant="success" label="Online" />}
      />
      <Avatar
        name="Ann Smith"
        size="large"
        status={<AvatarStatusDot variant="neutral" label="Offline" />}
      />
      <Avatar
        name="Carol Davis"
        size="large"
        status={<AvatarStatusDot variant="error" label="Busy" />}
      />
    </Stack>
  );
}
