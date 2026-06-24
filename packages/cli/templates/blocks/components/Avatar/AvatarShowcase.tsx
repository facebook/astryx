// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Avatar, AvatarStatusDot} from '@astryxdesign/core/Avatar';
import {Stack} from '@astryxdesign/core/Layout';

const CDN = 'https://lookaside.facebook.com/assets/astryx';

export default function AvatarShowcase() {
  return (
    <Stack direction="horizontal" gap={4} vAlign="center">
      <Avatar
        src={`${CDN}/DATA-Ana-Thomas.png`}
        name="Ana Thomas"
        size="large"
        status={<AvatarStatusDot variant="success" label="Online" />}
      />
      <Avatar
        src={`${CDN}/DATA-Drew-Young.png`}
        name="Drew Young"
        size="large"
      />
      <Avatar
        src={`${CDN}/DATA-Jihoo-Song.png`}
        name="Jihoo Song"
        size="large"
      />
      <Avatar
        src={`${CDN}/DATA-Nam-Tran.png`}
        name="Nam Tran"
        size="large"
        status={<AvatarStatusDot variant="error" label="Online" />}
      />
    </Stack>
  );
}
