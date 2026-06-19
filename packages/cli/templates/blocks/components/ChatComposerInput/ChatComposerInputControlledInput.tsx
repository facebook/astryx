// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {ChatComposer, ChatComposerInput} from '@xds/core/Chat';
import {Stack} from '@xds/core/Layout';
import {Text} from '@xds/core/Text';

export default function ChatComposerInputControlledInput() {
  const [value, setValue] = useState('');
  return (
    <Stack direction="vertical" gap={3} style={{width: '100%', maxWidth: 450}}>
      <ChatComposer
        onSubmit={() => setValue('')}
        value={value}
        onChange={setValue}
        input={
          <ChatComposerInput
            value={value}
            onChange={setValue}
            placeholder="Type a message..."
          />
        }
      />
      <Text type="supporting" color="secondary">
        Value: {JSON.stringify(value)}
      </Text>
    </Stack>
  );
}
