'use client';

import {
  XDSChatTokenizedText,
  XDSChatMessage,
  XDSChatMessageBubble,
} from '@xds/core/Chat';

const tokens = [
  {value: '@cindy', label: '@Cindy Zhang', variant: 'blue' as const},
];

export default function ChatTokenizedTextSingleMention() {
  return (
    <XDSChatMessage sender="user">
      <XDSChatMessageBubble>
        <XDSChatTokenizedText tokens={tokens}>
          Hey @cindy can you review this?
        </XDSChatTokenizedText>
      </XDSChatMessageBubble>
    </XDSChatMessage>
  );
}
