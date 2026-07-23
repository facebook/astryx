// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {ChatComposer} from '@astryxdesign/core/Chat';
import {Stack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';

export default function ChatComposerFlat() {
  return (
    <Stack direction="vertical" gap={2} style={{width: '100%', maxWidth: 450}}>
      <Text type="supporting" color="secondary">
        elevation=&quot;none&quot; — flat; depth comes from the border and focus
        ring
      </Text>
      <ChatComposer
        elevation="none"
        onSubmit={value => {
          console.log('Sent:', value);
        }}
      />
    </Stack>
  );
}
