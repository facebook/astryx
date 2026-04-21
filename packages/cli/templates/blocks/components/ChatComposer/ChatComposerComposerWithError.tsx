'use client';

import {XDSChatComposer} from '@xds/core/Chat';

export default function ChatComposerComposerWithError() {
  return (
    <XDSChatComposer
      onSubmit={() => {}}
      status={{
        type: 'error',
        message: 'Failed to send message. Please try again.',
      }}
    />
  );
}
