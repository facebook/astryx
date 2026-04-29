'use client';

import {
  XDSChatTokenizedText,
  XDSChatMessage,
  XDSChatMessageBubble,
} from '@xds/core/Chat';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

const tokens = [
  {value: '@cindy', label: '@Cindy', variant: 'blue' as const},
  {value: '#bug', label: '#bug', variant: 'red' as const},
  {value: '#feat', label: '#feature', variant: 'green' as const},
];

export default function ChatTokenizedTextMixedVariantTokens() {
  return (
    <XDSStack direction="vertical" gap={3}>
      <XDSText type="supporting" color="secondary">
        Color variants distinguish token types
      </XDSText>
      <XDSChatMessage sender="user">
        <XDSChatMessageBubble>
          <XDSChatTokenizedText tokens={tokens}>
            @cindy filed #bug and #feat for the sprint
          </XDSChatTokenizedText>
        </XDSChatMessageBubble>
      </XDSChatMessage>
    </XDSStack>
  );
}
