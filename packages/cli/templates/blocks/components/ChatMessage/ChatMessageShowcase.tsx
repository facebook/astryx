'use client';

import {
  XDSChatMessageList,
  XDSChatMessage,
  XDSChatMessageBubble,
} from '@xds/core/Chat';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSText} from '@xds/core/Text';

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
            <XDSText type="supporting" weight="semibold" color="secondary">
              Navi
            </XDSText>
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
