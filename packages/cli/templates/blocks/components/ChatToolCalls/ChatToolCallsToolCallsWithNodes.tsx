'use client';

import {XDSChatToolCalls} from '@xds/core/Chat';

export default function ChatToolCallsToolCallsWithNodes() {
  return (
    <XDSChatToolCalls
      calls={[
        {
          name: 'bash',
          target: 'yarn test',
          status: 'complete',
          duration: '4.2s',
          node: 'cli:devvm',
        },
        {
          name: 'bash',
          target: 'yarn build',
          status: 'complete',
          duration: '12s',
          node: 'cli:devvm',
        },
        {
          name: 'read',
          target: 'README.md',
          status: 'complete',
          duration: '30ms',
          node: 'workspace',
        },
        {
          name: 'web_search',
          target: 'CSS anchor positioning',
          status: 'complete',
          duration: '1.8s',
        },
      ]}
    />
  );
}
