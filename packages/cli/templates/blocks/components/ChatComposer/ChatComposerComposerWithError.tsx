'use client';

import {XDSChatComposer} from '@xds/core/Chat';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function ChatComposerComposerWithError() {
  return (
    <XDSStack direction="vertical" gap={4} style={{width: '100%', maxWidth: 450}}>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Error — below the composer
        </XDSText>
        <XDSChatComposer
          onSubmit={value => {
            console.log('Sent:', value);
          }}
          status={{
            type: 'error',
            message: 'Failed to send message. Please try again.',
          }}
        />
      </XDSStack>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Warning — above the composer
        </XDSText>
        <XDSChatComposer
          onSubmit={value => {
            console.log('Sent:', value);
          }}
          statusPosition="top"
          status={{
            type: 'warning',
            message: 'Context window is 90% full.',
          }}
        />
      </XDSStack>
    </XDSStack>
  );
}
