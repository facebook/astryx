// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {ChatComposer, ChatComposerInput} from '@xds/core/Chat';
import {Stack} from '@xds/core/Layout';

export default function ChatComposerInputDisabled() {
  return (
    <Stack direction="vertical" style={{width: '100%', maxWidth: 450}}>
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
