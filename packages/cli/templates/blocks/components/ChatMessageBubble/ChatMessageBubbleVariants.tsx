'use client';

import {
  XDSChatMessageList,
  XDSChatMessage,
  XDSChatMessageBubble,
} from '@xds/core/Chat';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function ChatMessageBubbleVariants() {
  return (
    <XDSStack direction="vertical" gap={4} style={{maxWidth: 500}}>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Filled — sender-colored background (default)
        </XDSText>
        <XDSChatMessageList>
          <XDSChatMessage sender="user">
            <XDSChatMessageBubble>
              Can you summarize the latest deployment logs?
            </XDSChatMessageBubble>
          </XDSChatMessage>
        </XDSChatMessageList>
      </XDSStack>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Ghost — transparent background, keeps alignment padding
        </XDSText>
        <XDSChatMessageList>
          <XDSChatMessage sender="assistant">
            <XDSChatMessageBubble variant="ghost">
              The last deploy completed at 2:41 PM with zero errors across all
              three regions.
            </XDSChatMessageBubble>
          </XDSChatMessage>
        </XDSChatMessageList>
      </XDSStack>
    </XDSStack>
  );
}
