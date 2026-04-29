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
];

export default function ChatTokenizedTextSingleMention() {
  return (
    <XDSStack direction="vertical" gap={3}>
      <XDSText type="supporting" color="secondary">
        Single @mention resolved to a display name
      </XDSText>
      <XDSChatMessage sender="user">
        <XDSChatMessageBubble>
          <XDSChatTokenizedText tokens={tokens}>
            Hey @cindy can you review this?
          </XDSChatTokenizedText>
        </XDSChatMessageBubble>
      </XDSChatMessage>
    </XDSStack>
  );
}
