// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Avatar} from '@xds/core/Avatar';
import {Stack} from '@xds/core/Layout';

const CDN = 'https://lookaside.facebook.com/assets/astryx';

export default function AvatarWithImage() {
  return (
    <Stack direction="horizontal" gap={4} vAlign="center">
      <Avatar src={`${CDN}/DATA-Ami-Pena.png`} name="Ami Pena" size="tiny" />
      <Avatar
        src={`${CDN}/DATA-Ana-Thomas.png`}
        name="Ana Thomas"
        size="small"
      />
      <Avatar
        src={`${CDN}/DATA-Daniela-Gimenez.png`}
        name="Daniela Gimenez"
        size="medium"
      />
      <Avatar
        src={`${CDN}/DATA-Gabriela-Fernandez.png`}
        name="Gabriela Fernandez"
        size="large"
      />
    </Stack>
  );
}
