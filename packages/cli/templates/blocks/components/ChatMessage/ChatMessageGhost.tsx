'use client';

import {
  XDSChatMessageList,
  XDSChatMessage,
  XDSChatMessageBubble,
  XDSChatMessageMetadata,
} from '@xds/core/Chat';
import {XDSTimestamp} from '@xds/core/Timestamp';
import {XDSText} from '@xds/core/Text';

export default function ChatMessageGhost() {
  return (
    <XDSChatMessageList style={{maxWidth: 500}}>
      <XDSChatMessage sender="assistant">
        <XDSChatMessageBubble
          variant="ghost"
          metadata={
            <XDSChatMessageMetadata
              timestamp={
                <XDSTimestamp value="2026-04-28T09:45:00" format="time" />
              }
              footer={
                <XDSText type="supporting" color="secondary">
                  Claude Opus 4.6
                </XDSText>
              }
            />
          }>
          Here is an analysis of your production metrics from last week. Traffic
          peaked at 12,400 requests per second on Wednesday, with a p99 latency
          of 45ms. Error rate stayed below 0.1% across all endpoints.
        </XDSChatMessageBubble>
      </XDSChatMessage>

      <XDSChatMessage sender="user">
        <XDSChatMessageBubble>
          That looks great. Can you compare it to the week before?
        </XDSChatMessageBubble>
      </XDSChatMessage>

      <XDSChatMessage sender="assistant">
        <XDSChatMessageBubble
          variant="ghost"
          metadata={
            <XDSChatMessageMetadata
              timestamp={
                <XDSTimestamp value="2026-04-28T09:46:00" format="time" />
              }
              footer={
                <XDSText type="supporting" color="secondary">
                  Claude Opus 4.6
                </XDSText>
              }
            />
          }>
          Compared to the previous week, traffic is up 8% and latency improved
          by 3ms. The deployment on Tuesday seems to have helped.
        </XDSChatMessageBubble>
      </XDSChatMessage>
    </XDSChatMessageList>
  );
}
