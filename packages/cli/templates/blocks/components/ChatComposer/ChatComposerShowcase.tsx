// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {ChatComposer} from '@xds/core/Chat';
import {Stack} from '@xds/core/Layout';

export default function ChatComposerShowcase() {
  return (
    <Stack direction="vertical" width="100%" style={{maxWidth: 450}}>
      <ChatComposer
        onSubmit={() => {}}
        placeholder="Type a message…"
      />
    </Stack>
  );
}
