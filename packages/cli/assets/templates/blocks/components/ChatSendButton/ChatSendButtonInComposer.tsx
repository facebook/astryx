// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {ChatComposer} from '@astryxdesign/core/Chat';
import {Stack} from '@astryxdesign/core/Layout';

export default function ChatSendButtonInComposer() {
  return (
    <Stack direction="vertical" width={450} maxWidth="100%">
      <ChatComposer
        onSubmit={() => {}}
        value="Hello, how can you help?"
        onChange={() => {}}
      />
    </Stack>
  );
}
