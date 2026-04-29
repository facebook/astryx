'use client';

import {
  XDSChatTokenizedText,
  XDSChatMessage,
  XDSChatMessageBubble,
  XDSChatMessageList,
} from '@xds/core/Chat';

const tokens = [
  {value: '@cindy', label: '@Cindy Zhang', variant: 'blue' as const},
  {value: '@agent', label: '@Agent', variant: 'blue' as const},
  {value: '@alex', label: '@Alex Rivera', variant: 'blue' as const},
];

export default function ChatTokenizedTextMultipleMentions() {
  return (
    <XDSChatMessageList>
      <XDSChatMessage sender="user">
        <XDSChatMessageBubble>
          <XDSChatTokenizedText tokens={tokens}>
            @cindy and @alex can @agent help with the review?
          </XDSChatTokenizedText>
        </XDSChatMessageBubble>
      </XDSChatMessage>
    </XDSChatMessageList>
  );
}
