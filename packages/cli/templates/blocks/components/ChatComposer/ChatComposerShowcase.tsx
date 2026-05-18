// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSChatComposer} from '@xds/core/Chat';
import {XDSStack} from '@xds/core/Layout';

export default function ChatComposerShowcase() {
  return (
    <XDSStack direction="vertical" width="100%" style={{maxWidth: 450}}>
      <XDSChatComposer
        onSubmit={() => {}}
        placeholder="Type a message…"
      />
    </XDSStack>
  );
}
