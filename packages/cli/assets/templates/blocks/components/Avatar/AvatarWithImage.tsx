// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Avatar} from '@astryxdesign/core/Avatar';
import {Stack} from '@astryxdesign/core/Layout';

export default function AvatarWithImage() {
  return (
    <Stack direction="horizontal" gap={4} vAlign="center">
      <Avatar
        src="/template-assets/DATA-Ami-Pena.png"
        name="Ami Pena"
        size="xsm"
      />
      <Avatar
        src="/template-assets/DATA-Ana-Thomas.png"
        name="Ana Thomas"
        size="md"
      />
      <Avatar
        src="/template-assets/DATA-Daniela-Gimenez.png"
        name="Daniela Gimenez"
        size="lg"
      />
      <Avatar
        src="/template-assets/DATA-Gabriela-Fernandez.png"
        name="Gabriela Fernandez"
        size="xl"
      />
    </Stack>
  );
}
