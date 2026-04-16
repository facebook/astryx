'use client';

import {
  XDSChatMessageList,
  XDSChatMessage,
  XDSChatBubble,
} from '@xds/core/Chat';

export default function ChatShowcase() {
  return (
    <XDSChatMessageList>
      <XDSChatMessage sender="user">
        <XDSChatBubble>Hello</XDSChatBubble>
      </XDSChatMessage>
    </XDSChatMessageList>
  );
}
