'use client';

import {useState} from 'react';
import {XDSChatComposer} from '@xds/core/Chat';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function ChatComposerStreaming() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [value, setValue] = useState(
    'Click the send button to start streaming.',
  );

  return (
    <XDSStack
      direction="vertical"
      gap={4}
      style={{width: '100%', maxWidth: 450}}>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          {isStreaming
            ? 'Streaming — click stop to cancel'
            : 'Send a message to start streaming'}
        </XDSText>
        <XDSChatComposer
          value={value}
          onChange={setValue}
          onSubmit={value => {
            console.log('Sent:', value);
            setValue('');
            setIsStreaming(true);
            setTimeout(() => setIsStreaming(false), 5000);
          }}
          isStreaming={isStreaming}
          onStop={() => {
            console.log('Stopped');
            setIsStreaming(false);
          }}
          placeholder="Send a message to start streaming..."
        />
      </XDSStack>
    </XDSStack>
  );
}
