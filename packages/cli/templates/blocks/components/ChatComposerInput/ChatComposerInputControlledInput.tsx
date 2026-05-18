// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {XDSChatComposer, XDSChatComposerInput} from '@xds/core/Chat';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function ChatComposerInputControlledInput() {
  const [value, setValue] = useState('');
  return (
    <XDSStack direction="vertical" gap={3} style={{width: '100%', maxWidth: 450}}>
      <XDSChatComposer
        onSubmit={() => setValue('')}
        value={value}
        onChange={setValue}
        input={
          <XDSChatComposerInput
            value={value}
            onChange={setValue}
            placeholder="Type a message..."
          />
        }
      />
      <XDSText type="supporting" color="secondary">
        Value: {JSON.stringify(value)}
      </XDSText>
    </XDSStack>
  );
}
