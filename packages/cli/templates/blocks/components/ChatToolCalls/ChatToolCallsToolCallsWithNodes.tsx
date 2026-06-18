// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {ChatToolCalls} from '@xds/core/Chat';
import {Stack} from '@xds/core/Layout';

export default function ChatToolCallsSimple() {
  return (
    <Stack direction="vertical" gap={4}>
      <ChatToolCalls
        calls={[
          {
            name: 'bash',
            target: 'git status',
            status: 'complete',
            duration: '1.2s',
          },
        ]}
      />
      <ChatToolCalls
        defaultIsExpanded
        calls={[
          {
            name: 'read',
            target: 'src/components/DataGrid.tsx',
            status: 'complete',
            duration: '30ms',
          },
          {
            name: 'edit',
            target: 'src/components/DataGrid.tsx',
            status: 'complete',
            duration: '85ms',
            additions: 24,
            deletions: 8,
          },
          {
            name: 'edit',
            target: 'src/components/DataGrid.test.tsx',
            status: 'complete',
            duration: '60ms',
            additions: 45,
          },
        ]}
      />
    </Stack>
  );
}
