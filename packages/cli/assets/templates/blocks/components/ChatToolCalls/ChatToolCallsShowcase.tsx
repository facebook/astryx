// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {ChatToolCalls} from '@astryxdesign/core/Chat';

export default function ChatToolCallsShowcase() {
  return (
    <ChatToolCalls
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
  );
}
