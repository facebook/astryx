'use client';

import {
  XDSChatMessageList,
  XDSChatMessage,
  XDSChatMessageBubble,
} from '@xds/core/Chat';
import {XDSMarkdown} from '@xds/core/Markdown';

export default function ChatShowcase() {
  return (
    <XDSChatMessageList>
      <XDSChatMessage sender="user">
        <XDSChatMessageBubble>
          How should I handle state management in a React app?
        </XDSChatMessageBubble>
      </XDSChatMessage>
      <XDSChatMessage sender="assistant">
        <XDSMarkdown density="compact">{`For most cases, **React's built-in state** is sufficient:

- \`useState\` for local component state
- \`useReducer\` for complex state logic
- \`useContext\` for shared state across a subtree

For **server state**, use a library like **TanStack Query** or **SWR**.`}</XDSMarkdown>
      </XDSChatMessage>
    </XDSChatMessageList>
  );
}
