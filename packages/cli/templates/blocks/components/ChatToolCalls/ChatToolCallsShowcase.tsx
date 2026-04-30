'use client';

import {XDSChatToolCalls} from '@xds/core/Chat';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function ChatToolCallsShowcase() {
  return (
    <XDSStack direction="vertical" gap={6}>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Single call — inline
        </XDSText>
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
      </XDSStack>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Multiple calls — collapsible group
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
              target: 'src/utils/formatDate.ts',
              status: 'complete',
              duration: '45ms',
            },
            {
              name: 'edit',
              target: 'src/utils/formatDate.ts',
              status: 'complete',
              duration: '120ms',
              additions: 12,
              deletions: 3,
            },
          ]}
        />
      </XDSStack>
    </XDSStack>
  );
}
