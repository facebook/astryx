'use client';

import {
  XDSChatTokenizedText,
  XDSChatMessage,
  XDSChatMessageBubble,
} from '@xds/core/Chat';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

const tokens = [
  {value: '@cindy', label: '@Cindy Zhang', variant: 'blue' as const},
  {value: '@navi', label: '@Navi', variant: 'blue' as const},
];

export default function ChatTokenizedTextEdgePositions() {
  return (
    <XDSStack direction="vertical" gap={3}>
      <XDSText type="supporting" color="secondary">
        Tokens at the start and end of a message
      </XDSText>
      <XDSChatMessage sender="user">
        <XDSChatMessageBubble>
          <XDSChatTokenizedText tokens={tokens}>
            @cindy this is for @navi
          </XDSChatTokenizedText>
        </XDSChatMessageBubble>
      </XDSChatMessage>
    </XDSStack>
  );
}
