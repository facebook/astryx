// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Avatar} from '@xds/core/Avatar';
import {Stack} from '@xds/core/Layout';

export default function AvatarWithImage() {
  return (
    <Stack direction="horizontal" gap={4} vAlign="center">
      <Avatar name="Alex Daniles" size="tiny" />
      <Avatar name="Ann Smith" size="small" />
      <Avatar name="Carol Davis" size="medium" />
      <Avatar name="Gina Wilson" size="large" />
    </Stack>
  );
}
