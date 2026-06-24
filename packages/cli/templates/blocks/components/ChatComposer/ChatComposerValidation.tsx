// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {ChatComposer} from '@astryxdesign/core/Chat';
import {Stack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';

export default function ChatComposerValidation() {
  return (
    <Stack direction="vertical" gap={4} style={{width: '100%', maxWidth: 450}}>
      <Stack direction="vertical" gap={1}>
        <Text type="supporting" color="secondary">
          Error message (with top position)
        </Text>
        <ChatComposer
          onSubmit={value => {
            console.log('Sent:', value);
          }}
          statusPosition="top"
          status={{
            type: 'error',
            message: 'Failed to send message. Please try again.',
          }}
        />
      </Stack>
      <Stack direction="vertical" gap={1}>
        <Text type="supporting" color="secondary">
          Warning message (with bottom position)
        </Text>
        <ChatComposer
          onSubmit={value => {
            console.log('Sent:', value);
          }}
          status={{
            type: 'warning',
            message: 'Context window is 90% full.',
          }}
        />
      </Stack>
    </Stack>
  );
}
