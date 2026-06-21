// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Avatar, AvatarStatusDot} from '@xds/core/Avatar';
import {Stack} from '@xds/core/Layout';

export default function AvatarShowcase() {
  return (
    <Stack direction="horizontal" gap={4} vAlign="center">
      <Avatar
        name="Ann Smith"
        size="large"
        status={<AvatarStatusDot variant="success" label="Online" />}
      />
      <Avatar name="Alex Daniels" size="large" />
      <Avatar name="Sam Chen" size="large" />
      <Avatar
        name="Taylor Nguyen"
        size="large"
        status={<AvatarStatusDot variant="error" label="Online" />}
      />
    </Stack>
  );
}
