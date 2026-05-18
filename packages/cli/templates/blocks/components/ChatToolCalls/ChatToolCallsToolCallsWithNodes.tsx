// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSChatToolCalls} from '@xds/core/Chat';
import {XDSStack} from '@xds/core/Layout';

export default function ChatToolCallsSimple() {
  return (
    <XDSStack direction="vertical" gap={4}>
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
      <XDSChatToolCalls
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
    </XDSStack>
  );
}
