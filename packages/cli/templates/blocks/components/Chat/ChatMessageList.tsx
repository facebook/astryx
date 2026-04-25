'use client';

import {
  XDSChatMessageList,
  XDSChatMessage,
  XDSChatMessageBubble,
  XDSChatMessageMetadata,
  XDSChatSystemMessage,
  XDSChatTokenizedText,
} from '@xds/core/Chat';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSMarkdown} from '@xds/core/Markdown';
import {XDSTimestamp} from '@xds/core/Timestamp';
import { XDSText } from '@xds/core/Text';

const TOKENS = [{value: '@agent', label: '@agent', variant: 'red' as const}];

export default function ChatMessageList() {
  return (
    <XDSChatMessageList density="spacious">
      <XDSChatSystemMessage variant="divider">Today</XDSChatSystemMessage>

      <XDSChatMessage sender="user">
        <XDSChatMessageBubble>
          <XDSChatTokenizedText tokens={TOKENS}>
            @agent How should I handle state management in a React app?
          </XDSChatTokenizedText>
        </XDSChatMessageBubble>
      </XDSChatMessage>

      <XDSChatMessage
        sender="assistant"
        avatar={<XDSAvatar name="Agent" size="small" />}>
        <XDSChatMessageBubble variant="ghost">
          <XDSMarkdown density="compact">{
  `For most cases, **React's built-in state** is sufficient:
  - \`useState\` for local component state
  - \`useReducer\` for complex state logic
  - \`useContext\` for shared state across a subtree
  Avoid global state managers unless you have a genuine need for cross-cutting state.`
          }</XDSMarkdown>
        </XDSChatMessageBubble>
        <XDSChatMessageMetadata
          timestamp={
            <XDSTimestamp value="2026-03-15T14:30:30" format="time" />
          }
          footer={<span>AI Agent 2.0</span>}
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

      <XDSChatSystemMessage>Agent is thinking…</XDSChatSystemMessage>
    </XDSChatMessageList>
  );
}
