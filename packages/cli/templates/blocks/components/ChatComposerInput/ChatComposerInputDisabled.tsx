// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {ChatComposer, ChatComposerInput} from '@astryxdesign/core/Chat';
import {Stack} from '@astryxdesign/core/Layout';

export default function ChatComposerInputDisabled() {
  return (
    <Stack direction="vertical" style={{width: 450, maxWidth: '100%'}}>
      <ChatComposer
        onSubmit={() => {}}
        isDisabled
        input={
          <ChatComposerInput isDisabled placeholder="Input is disabled" />
        }
      />
    </Stack>
  );
}
