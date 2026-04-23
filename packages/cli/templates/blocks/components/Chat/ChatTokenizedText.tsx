'use client';

import {
  XDSChatTokenizedText,
  XDSChatMessage,
  XDSChatMessageBubble,
  XDSChatMessageList,
} from '@xds/core/Chat';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

const mentionTokens = [
  {value: '@cindy', label: '@Cindy Zhang', variant: 'blue' as const},
  {value: '@navi', label: '@Navi', variant: 'blue' as const},
  {value: '@alex', label: '@Alex Rivera', variant: 'blue' as const},
];

const mixedTokens = [
  {value: '@cindy', label: '@Cindy', variant: 'blue' as const},
  {value: '#bug', label: '#bug', variant: 'red' as const},
  {value: '#feat', label: '#feature', variant: 'green' as const},
];

export default function ChatTokenizedText() {
  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Single mention
        </XDSText>
        <XDSChatMessageList>
          <XDSChatMessage sender="user">
            <XDSChatMessageBubble>
              <XDSChatTokenizedText tokens={mentionTokens}>
                Hey @cindy can you review this?
              </XDSChatTokenizedText>
            </XDSChatMessageBubble>
          </XDSChatMessage>
        </XDSChatMessageList>
      </XDSStack>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Multiple mentions
        </XDSText>
        <XDSChatMessageList>
          <XDSChatMessage sender="user">
            <XDSChatMessageBubble>
              <XDSChatTokenizedText tokens={mentionTokens}>
                @cindy and @alex can @navi help with the review?
              </XDSChatTokenizedText>
            </XDSChatMessageBubble>
          </XDSChatMessage>
        </XDSChatMessageList>
      </XDSStack>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Mixed variants
        </XDSText>
        <XDSChatMessageList>
          <XDSChatMessage sender="user">
            <XDSChatMessageBubble>
              <XDSChatTokenizedText tokens={mixedTokens}>
                @cindy filed #bug and #feat for the sprint
              </XDSChatTokenizedText>
            </XDSChatMessageBubble>
          </XDSChatMessage>
        </XDSChatMessageList>
      </XDSStack>
    </XDSStack>
  );
}
