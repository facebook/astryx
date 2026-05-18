// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSChatComposer, XDSChatComposerInput} from '@xds/core/Chat';
import {XDSStack} from '@xds/core/Layout';

export default function ChatComposerInputShowcase() {
  return (
    <XDSStack direction="vertical" style={{width: '100%', maxWidth: 450}}>
      <XDSChatComposer
        onSubmit={() => {}}
        input={
          <XDSChatComposerInput placeholder="Ask me anything about XDS..." />
        }
      />
    </XDSStack>
  );
}
