'use client';

import {
  XDSChatMessageList,
  XDSChatMessage,
  XDSChatMessageBubble,
  XDSChatMessageMetadata,
} from '@xds/core/Chat';
import {XDSMarkdown} from '@xds/core/Markdown';
import {XDSTimestamp} from '@xds/core/Timestamp';

export default function ChatSimpleConversation() {
  return (
    <XDSChatMessageList>
      <XDSChatMessage sender="user">
        <XDSChatMessageBubble
          metadata={
            <XDSChatMessageMetadata
              timestamp={
                <XDSTimestamp value="2026-03-15T14:30:00" format="time" />
              }
              status="read"
            />
          }>
          How should I handle state management in a React app?
        </XDSChatMessageBubble>
      </XDSChatMessage>
      <XDSChatMessage sender="assistant">
        <XDSMarkdown density="compact">{`For most cases, **React's built-in state** is sufficient:

- \`useState\` for local component state
- \`useReducer\` for complex state logic
- \`useContext\` for shared state across a subtree

For **server state**, use a library like **TanStack Query** or **SWR** — they handle caching, revalidation, and loading states out of the box.

Avoid global state managers unless you have a genuine need for cross-cutting state.`}</XDSMarkdown>
        <XDSChatMessageMetadata
          timestamp={
            <XDSTimestamp value="2026-03-15T14:30:30" format="time" />
          }
          footer={<span>Claude Opus 4.6</span>}
        />
      </XDSChatMessage>
    </XDSChatMessageList>
  );
}
