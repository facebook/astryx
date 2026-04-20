'use client';

import {XDSChatToolCalls} from '@xds/core/Chat';

export default function ChatToolCallsShowcase() {
  return (
    <XDSChatToolCalls
      calls={[
        {
          name: 'bash',
          target: 'git status',
          status: 'complete',
          duration: '1.2s',
        },
      ]}
    />
  );
}
