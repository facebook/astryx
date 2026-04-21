'use client';

import {
  XDSChatTokenizedText,
  XDSChatMessage,
  XDSChatMessageBubble,
} from '@xds/core/Chat';

const tokens = [
  {value: '@cindy', label: '@Cindy', variant: 'blue' as const},
  {value: '#bug', label: '#bug', variant: 'red' as const},
  {value: '#feat', label: '#feature', variant: 'green' as const},
];

export default function ChatTokenizedTextMixedVariantTokens() {
  return (
    <XDSChatMessage sender="user">
      <XDSChatMessageBubble>
        <XDSChatTokenizedText tokens={tokens}>
          @cindy filed #bug and #feat for the sprint
        </XDSChatTokenizedText>
      </XDSChatMessageBubble>
    </XDSChatMessage>
  );
}
