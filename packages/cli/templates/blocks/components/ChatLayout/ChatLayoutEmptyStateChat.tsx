'use client';

import {XDSChatLayout, XDSChatComposer} from '@xds/core/Chat';
import {XDSEmptyState} from '@xds/core/EmptyState';

export default function ChatLayoutEmptyStateChat() {
  return (
    <div style={{height: '100vh', display: 'flex', flexDirection: 'column'}}>
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
    </div>
  );
}
