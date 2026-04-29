'use client';

import {
  XDSChatTokenizedText,
  XDSChatMessage,
  XDSChatMessageBubble,
} from '@xds/core/Chat';
import {XDSStack} from '@xds/core/Layout';

const mentionTokens = [
  {value: '@cindy', label: '@Cindy Zhang', variant: 'blue' as const},
  {value: '#bug', label: '#bug', variant: 'red' as const},
];

export default function ChatTokenizedTextShowcase() {
  return (
    <XDSStack direction="vertical" gap={3}>
      <XDSChatMessage sender="user">
        <XDSChatMessageBubble>
          <XDSChatTokenizedText tokens={mentionTokens}>
            Hey @cindy can you look at #bug before the release?
          </XDSChatTokenizedText>
        </XDSChatMessageBubble>
      </XDSChatMessage>
    </XDSStack>
  );
}
