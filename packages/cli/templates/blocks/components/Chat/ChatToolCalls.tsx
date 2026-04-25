'use client';

import {XDSChatToolCalls} from '@xds/core/Chat';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function ChatToolCalls() {
  return (
    <XDSStack direction="vertical" gap={6}>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Multiple calls with stats
        </XDSText>
        <XDSChatToolCalls
          defaultIsExpanded
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
      </XDSStack>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Multiple calls with an error
        </XDSText>
        <XDSChatToolCalls
          defaultIsExpanded
          calls={[
            {
              name: 'bash',
              target: 'yarn build',
              status: 'complete',
              duration: '8s',
              node: 'cli:devvm',
            },
            {
              name: 'bash',
              target: 'yarn test',
              status: 'error',
              duration: '2.1s',
              node: 'cli:devvm',
              errorMessage: 'Process exited with code 1',
            },
          ]}
        />
      </XDSStack>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Running
        </XDSText>
        <XDSChatToolCalls
          calls={[
            {
              name: 'bash',
              target: 'yarn test --watch',
              status: 'running',
              node: 'cli:devvm',
            },
          ]}
        />
      </XDSStack>
    </XDSStack>
  );
}
