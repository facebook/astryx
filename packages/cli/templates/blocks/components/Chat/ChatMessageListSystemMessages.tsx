'use client';

import {
  XDSChatMessageList,
  XDSChatMessage,
  XDSChatMessageBubble,
  XDSChatSystemMessage,
} from '@xds/core/Chat';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSMarkdown} from '@xds/core/Markdown';

export default function ChatMessageListSystemMessages() {
  return (
    <XDSChatMessageList>
      <XDSChatSystemMessage variant="divider">
        March 15, 2026
      </XDSChatSystemMessage>

      <XDSChatMessage
        sender="assistant"
        avatar={<XDSAvatar name="Navi" size="small" />}>
        <XDSMarkdown density="compact">Good morning!</XDSMarkdown>
      </XDSChatMessage>

      <XDSChatSystemMessage>Conversation started</XDSChatSystemMessage>

      <XDSChatMessage sender="user">
        <XDSChatMessageBubble>Hey Navi</XDSChatMessageBubble>
      </XDSChatMessage>

      <XDSChatSystemMessage variant="divider">Today</XDSChatSystemMessage>

      <XDSChatSystemMessage>Cindy shared a file</XDSChatSystemMessage>

      <XDSChatMessage sender="user">
        <XDSChatMessageBubble>Let me check the attachment</XDSChatMessageBubble>
      </XDSChatMessage>
    </XDSChatMessageList>
  );
}
