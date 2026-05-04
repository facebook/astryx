'use client';

import {
  XDSChatMessageList,
  XDSChatMessage,
  XDSChatMessageBubble,
  XDSChatMessageMetadata,
} from '@xds/core/Chat';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSTimestamp} from '@xds/core/Timestamp';
import {XDSText} from '@xds/core/Text';

export default function ChatMessageMultiBubble() {
  return (
    <XDSChatMessageList style={{maxWidth: 500}}>
      <XDSChatMessage sender="user">
        <XDSChatMessageBubble group="first">
          I have a couple of questions about the new API.
        </XDSChatMessageBubble>
        <XDSChatMessageBubble group="middle">
          First, how should we handle pagination?
        </XDSChatMessageBubble>
        <XDSChatMessageBubble
          group="last"
          metadata={
            <XDSChatMessageMetadata
              timestamp={
                <XDSTimestamp value="2026-04-28T11:00:00" format="time" />
              }
              status="delivered"
            />
          }>
          And second, what's the rate limit?
        </XDSChatMessageBubble>
      </XDSChatMessage>

      <XDSChatMessage
        sender="assistant"
        avatar={<XDSAvatar name="Agent" size="small" />}>
        <XDSChatMessageBubble
          group="first"
          name={
            <XDSText type="supporting" weight="semibold" color="secondary">
              Agent
            </XDSText>
          }>
          Great questions! For pagination, use cursor-based with a limit
          parameter. The response includes a nextCursor field.
        </XDSChatMessageBubble>
        <XDSChatMessageBubble
          group="last"
          metadata={
            <XDSChatMessageMetadata
              timestamp={
                <XDSTimestamp value="2026-04-28T11:01:00" format="time" />
              }
            />
          }>
          Rate limit is 100 requests per minute per API key. You'll get a 429
          response with a Retry-After header if you exceed it.
        </XDSChatMessageBubble>
      </XDSChatMessage>
    </XDSChatMessageList>
  );
}
