'use client';

import {
  XDSChatMessageList,
  XDSChatMessage,
  XDSChatMessageBubble,
  XDSChatMessageMetadata,
  XDSChatSystemMessage,
} from '@xds/core/Chat';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSMarkdown} from '@xds/core/Markdown';
import {XDSTimestamp} from '@xds/core/Timestamp';

export default function ChatMessageList() {
  return (
    <div style={{height: 500, display: 'flex', flexDirection: 'column'}}>
      <XDSChatMessageList>
        <XDSChatSystemMessage variant="divider">Today</XDSChatSystemMessage>

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

        <XDSChatMessage
          sender="assistant"
          avatar={<XDSAvatar name="Navi" size="small" />}>
          <XDSChatMessageBubble
            name={
              <span style={{fontSize: 12, fontWeight: 600, color: '#666'}}>
                Navi
              </span>
            }>
            <XDSMarkdown density="compact">{`For most cases, **React's built-in state** is sufficient:

- \`useState\` for local component state
- \`useReducer\` for complex state logic
- \`useContext\` for shared state across a subtree

Avoid global state managers unless you have a genuine need for cross-cutting state.`}</XDSMarkdown>
          </XDSChatMessageBubble>
          <XDSChatMessageMetadata
            timestamp={
              <XDSTimestamp value="2026-03-15T14:30:30" format="time" />
            }
            footer={<span>Claude Opus 4.6</span>}
          />
        </XDSChatMessage>

        <XDSChatMessage sender="user">
          <XDSChatMessageBubble group="first">
            That makes sense, thanks!
          </XDSChatMessageBubble>
          <XDSChatMessageBubble
            group="last"
            metadata={
              <XDSChatMessageMetadata
                timestamp={
                  <XDSTimestamp value="2026-03-15T14:31:00" format="time" />
                }
                status="delivered"
              />
            }>
            What about server state?
          </XDSChatMessageBubble>
        </XDSChatMessage>

        <XDSChatSystemMessage>Navi is thinking…</XDSChatSystemMessage>
      </XDSChatMessageList>
    </div>
  );
}
