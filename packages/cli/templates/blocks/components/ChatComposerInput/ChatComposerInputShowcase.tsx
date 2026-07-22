// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {ChatComposer, ChatComposerInput} from '@astryxdesign/core/Chat';
import {Stack} from '@astryxdesign/core/Layout';

export default function ChatComposerInputShowcase() {
  return (
    <Stack direction="vertical" style={{width: 450, maxWidth: '100%'}}>
      <ChatComposer
        onSubmit={() => {}}
        input={
          <ChatComposerInput placeholder="Ask me anything about Astryx..." />
        }
      />
    </Stack>
  );
}
