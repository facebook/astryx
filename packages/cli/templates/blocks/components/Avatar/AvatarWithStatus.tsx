// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Avatar, AvatarStatusDot} from '@astryxdesign/core/Avatar';
import {Stack} from '@astryxdesign/core/Layout';

const CDN = 'https://lookaside.facebook.com/assets/astryx';

export default function AvatarWithStatus() {
  return (
    <Stack direction="horizontal" gap={4} vAlign="center">
      <Avatar
        src={`${CDN}/DATA-Itai-Jordaan.png`}
        name="Itai Jordaan"
        size="large"
        status={<AvatarStatusDot variant="success" label="Online" />}
      />
      <Avatar
        src={`${CDN}/DATA-Margot-Schroder.png`}
        name="Margot Schroder"
        size="large"
        status={<AvatarStatusDot variant="neutral" label="Offline" />}
      />
      <Avatar
        src={`${CDN}/DATA-Pablo-Morales.png`}
        name="Pablo Morales"
        size="large"
        status={<AvatarStatusDot variant="error" label="Busy" />}
      />
    </Stack>
  );
}
