// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSChatComposer} from '@xds/core/Chat';
import {XDSStack} from '@xds/core/Layout';

export default function ChatComposerSimple() {
  return (
    <XDSStack direction="vertical" style={{width: '100%', maxWidth: 450}}>
      <XDSChatComposer
        onSubmit={value => {
          console.log('Sent:', value);
        }}
      />
    </XDSStack>
  );
}
