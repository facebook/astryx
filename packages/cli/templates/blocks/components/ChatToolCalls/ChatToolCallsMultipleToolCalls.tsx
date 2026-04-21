'use client';

import {XDSChatToolCalls} from '@xds/core/Chat';

export default function ChatToolCallsMultipleToolCalls() {
  return (
    <XDSChatToolCalls
      calls={[
        {
          name: 'bash',
          target: 'git diff --stat',
          status: 'complete',
          duration: '340ms',
        },
        {
          name: 'read',
          target: 'src/Button.tsx',
          status: 'complete',
          duration: '45ms',
        },
        {
          name: 'edit',
          target: 'src/Button.tsx',
          status: 'complete',
          duration: '120ms',
          additions: 12,
          deletions: 3,
        },
      ]}
    />
  );
}
