// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {ChatComposer} from '@xds/core/Chat';
import {Stack} from '@xds/core/Layout';

export default function ChatComposerSimple() {
  return (
    <Stack direction="vertical" style={{width: '100%', maxWidth: 450}}>
      <ChatComposer
        onSubmit={value => {
          console.log('Sent:', value);
        }}
      />
    </Stack>
  );
}
