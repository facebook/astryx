'use client';

import {XDSChatToolCalls} from '@xds/core/Chat';

export default function ChatToolCallsDiffStats() {
  return (
    <XDSChatToolCalls
      defaultIsExpanded
      calls={[
        {
          name: 'edit',
          target: 'src/components/DataGrid.tsx',
          status: 'complete',
          duration: '85ms',
          node: 'cli:devvm',
          additions: 24,
          deletions: 8,
        },
        {
          name: 'edit',
          target: 'src/components/DataGrid.test.tsx',
          status: 'complete',
          duration: '60ms',
          node: 'cli:devvm',
          additions: 45,
        },
        {
          name: 'bash',
          target: 'grep -r "sortColumn"',
          status: 'complete',
          duration: '200ms',
          node: 'cli:devvm',
          stats: '6 files \u00b7 14 matches',
        },
      ]}
    />
  );
}
