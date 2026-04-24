'use client';

import {
  XDSChatMessageList,
  XDSChatMessage,
  XDSChatMessageBubble,
} from '@xds/core/Chat';
import {XDSAvatar} from '@xds/core/Avatar';

export default function ChatMessageShowcase() {
  return (
    <XDSChatMessageList>
      <XDSChatMessage sender="user">
        <XDSChatMessageBubble>
          Can you review my pull request?
        </XDSChatMessageBubble>
      </XDSChatMessage>

      <XDSChatMessage
        sender="assistant"
        avatar={<XDSAvatar name="Navi" size="small" />}>
        <XDSChatMessageBubble
          name={
            <span style={{fontSize: 12, fontWeight: 600, opacity: 0.7}}>
              Navi
            </span>
          }>
          Sure! I'll take a look at the changes and get back to you shortly.
        </XDSChatMessageBubble>
      </XDSChatMessage>

      <XDSChatMessage sender="user">
        <XDSChatMessageBubble>Thanks, no rush.</XDSChatMessageBubble>
      </XDSChatMessage>
    </XDSChatMessageList>
  );
}
