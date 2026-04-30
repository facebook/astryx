'use client';

import {XDSChatReasoning} from '@xds/lab/ChatReasoning';
import {
  XDSChatMessageList,
  XDSChatMessage,
  XDSChatMessageBubble,
} from '@xds/core/Chat';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSMarkdown} from '@xds/core/Markdown';

export default function ChatReasoningInMessage() {
  return (
    <XDSChatMessageList>
      <XDSChatMessage sender="user">
        <XDSChatMessageBubble>
          How many valid planting arrangements are possible over 3 years?
        </XDSChatMessageBubble>
      </XDSChatMessage>
      <XDSChatMessage
        sender="assistant"
        avatar={<XDSAvatar name="AI" size="small" />}>
        <XDSChatReasoning duration="12s">
          Let me work through the constraints systematically. The farmer has 3
          fields and rotates wheat, corn, soy.
        </XDSChatReasoning>
        <XDSMarkdown density="compact">
          {`There are **42** valid planting arrangements over 3 years.`}
        </XDSMarkdown>
      </XDSChatMessage>
    </XDSChatMessageList>
  );
}
