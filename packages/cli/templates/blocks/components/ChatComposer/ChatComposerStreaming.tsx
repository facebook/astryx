// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {ChatComposer} from '@xds/core/Chat';
import {Stack} from '@xds/core/Layout';
import {Text} from '@xds/core/Text';

export default function ChatComposerStreaming() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [value, setValue] = useState(
    'Click the send button to start streaming.',
  );

  return (
    <Stack
      direction="vertical"
      gap={4}
      style={{width: '100%', maxWidth: 450}}>
      <Stack direction="vertical" gap={1}>
        <Text type="supporting" color="secondary">
          {isStreaming
            ? 'Streaming — click stop to cancel'
            : 'Send a message to start streaming'}
        </Text>
        <ChatComposer
          value={value}
          onChange={setValue}
          onSubmit={value => {
            console.log('Sent:', value);
            setValue('');
            setIsStreaming(true);
            setTimeout(() => setIsStreaming(false), 5000);
          }}
          isStopShown={isStreaming}
          onStop={() => {
            console.log('Stopped');
            setIsStreaming(false);
          }}
          placeholder="Send a message to start streaming..."
        />
      </Stack>
    </Stack>
  );
}
