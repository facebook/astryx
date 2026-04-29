'use client';

import {
  XDSChatMessageList,
  XDSChatMessage,
  XDSChatMessageBubble,
  XDSChatSystemMessage,
} from '@xds/core/Chat';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function ChatMessageSenders() {
  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSText type="supporting" color="secondary">
        Sender-based alignment
      </XDSText>
      <XDSChatMessageList>
        <XDSChatSystemMessage variant="divider">
          April 28, 2026
        </XDSChatSystemMessage>

        <XDSChatMessage sender="assistant">
          <XDSChatMessageBubble>
            I found three matching results for your query. Want me to filter by
            date range?
          </XDSChatMessageBubble>
        </XDSChatMessage>

        <XDSChatMessage sender="user">
          <XDSChatMessageBubble>
            Yes, only show results from the last 7 days.
          </XDSChatMessageBubble>
        </XDSChatMessage>

        <XDSChatSystemMessage>
          Agent updated the search filters
        </XDSChatSystemMessage>

        <XDSChatMessage sender="assistant">
          <XDSChatMessageBubble>
            Done — 2 results match the updated filters.
          </XDSChatMessageBubble>
        </XDSChatMessage>
      </XDSChatMessageList>
    </XDSStack>
  );
}
