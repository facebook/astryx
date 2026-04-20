'use client';

import {
  XDSChatTokenizedText,
  XDSChatMessage,
  XDSChatMessageBubble,
} from '@xds/core/Chat';

const tokens = [
  {value: '@cindy', label: '@Cindy Zhang', variant: 'blue' as const},
  {value: '@navi', label: '@Navi', variant: 'blue' as const},
  {value: '@alex', label: '@Alex Rivera', variant: 'blue' as const},
];

export default function ChatTokenizedTextMultipleMentions() {
  return (
    <XDSChatMessage sender="user">
      <XDSChatMessageBubble>
        <XDSChatTokenizedText tokens={tokens}>
          @cindy and @alex can @navi help with the review?
        </XDSChatTokenizedText>
      </XDSChatMessageBubble>
    </XDSChatMessage>
  );
}
