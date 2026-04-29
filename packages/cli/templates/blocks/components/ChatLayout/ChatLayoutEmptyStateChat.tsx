'use client';

import {XDSChatLayout, XDSChatComposer} from '@xds/core/Chat';
import {XDSEmptyState} from '@xds/core/EmptyState';
import {XDSVStack} from '@xds/core/Layout';

export default function ChatLayoutEmptyStateChat() {
  return (
    <XDSVStack height="100vh">
      <XDSChatLayout
        composer={
          <XDSChatComposer
            onSubmit={() => {}}
            placeholder="Start a conversation\u2026"
          />
        }
        emptyState={
          <XDSEmptyState
            title="No messages yet"
            description="Start a conversation by typing below."
          />
        }>
        {[]}
      </XDSChatLayout>
    </XDSVStack>
  );
}
