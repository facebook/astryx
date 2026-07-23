// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Avatar, AvatarStatusDot} from '@astryxdesign/core/Avatar';
import {Stack} from '@astryxdesign/core/Layout';

export default function AvatarShowcase() {
  return (
    <Stack direction="horizontal" gap={4} vAlign="center">
      <Avatar
        src="https://lookaside.facebook.com/assets/astryx/DATA-Ana-Thomas.png"
        name="Ana Thomas"
        size="xl"
        status={<AvatarStatusDot variant="success" label="Online" />}
      />
      <Avatar
        src="https://lookaside.facebook.com/assets/astryx/DATA-Drew-Young.png"
        name="Drew Young"
        size="xl"
      />
      <Avatar
        src="https://lookaside.facebook.com/assets/astryx/DATA-Jihoo-Song.png"
        name="Jihoo Song"
        size="xl"
      />
      <Avatar
        src="https://lookaside.facebook.com/assets/astryx/DATA-Nam-Tran.png"
        name="Nam Tran"
        size="xl"
        status={<AvatarStatusDot variant="error" label="Online" />}
      />
    </Stack>
  );
}
