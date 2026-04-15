'use client';

import {XDSAvatar} from '@xds/core/Avatar';
import {
  XDSChatMessage,
  XDSChatMessageBubble,
  XDSChatMessageList,
} from '@xds/core/Chat';

export default function ChatBasicConversation() {
  return (
    <XDSChatMessageList>
      <XDSChatMessage
        sender="assistant"
        name="Navi"
        avatar={<XDSAvatar name="Navi" size="small" />}>
        <XDSChatMessageBubble>Hello! How can I help?</XDSChatMessageBubble>
      </XDSChatMessage>
      <XDSChatMessage sender="user" name="Cindy">
        <XDSChatMessageBubble>What's the status?</XDSChatMessageBubble>
      </XDSChatMessage>
    </XDSChatMessageList>
  );
}
