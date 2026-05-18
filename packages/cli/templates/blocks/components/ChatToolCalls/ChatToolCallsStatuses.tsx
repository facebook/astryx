// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSChatToolCalls} from '@xds/core/Chat';

export default function ChatToolCallsStatuses() {
  return (
    <XDSChatToolCalls
      defaultIsExpanded
      calls={[
        {
          key: 'pending',
          name: 'bash',
          target: 'yarn build',
          status: 'pending',
        },
        {
          key: 'running',
          name: 'bash',
          target: 'yarn test',
          status: 'running',
        },
        {
          key: 'complete',
          name: 'edit',
          target: 'src/App.tsx',
          status: 'complete',
          duration: '120ms',
          additions: 8,
          deletions: 2,
        },
        {
          key: 'error',
          name: 'bash',
          target: 'yarn lint',
          status: 'error',
          duration: '0.8s',
          errorMessage: '3 lint errors found',
        },
      ]}
    />
  );
}
