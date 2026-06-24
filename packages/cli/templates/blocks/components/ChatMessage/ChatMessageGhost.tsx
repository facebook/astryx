// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {
  ChatMessageList,
  ChatMessage,
  ChatMessageBubble,
  ChatMessageMetadata,
} from '@astryxdesign/core/Chat';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {Text} from '@astryxdesign/core/Text';

export default function ChatMessageGhost() {
  return (
    <ChatMessageList style={{maxWidth: 500}}>
      <ChatMessage sender="assistant">
        <ChatMessageBubble
          variant="ghost"
          metadata={
            <ChatMessageMetadata
              timestamp={
                <Timestamp value="2026-04-28T09:45:00" format="time" />
              }
              footer={
                <Text type="supporting" color="secondary">
                  Claude Opus 4.6
                </Text>
              }
            />
          }>
          Here is an analysis of your production metrics from last week. Traffic
          peaked at 12,400 requests per second on Wednesday, with a p99 latency
          of 45ms. Error rate stayed below 0.1% across all endpoints.
        </ChatMessageBubble>
      </ChatMessage>
      <ChatMessage sender="user">
        <ChatMessageBubble>
          That looks great. Can you compare it to the week before?
        </ChatMessageBubble>
      </ChatMessage>
      <ChatMessage sender="assistant">
        <ChatMessageBubble
          variant="ghost"
          metadata={
            <ChatMessageMetadata
              timestamp={
                <Timestamp value="2026-04-28T09:46:00" format="time" />
              }
              footer={
                <Text type="supporting" color="secondary">
                  Claude Opus 4.6
                </Text>
              }
            />
          }>
          Compared to the previous week, traffic is up 8% and latency improved
          by 3ms. The deployment on Tuesday seems to have helped.
        </ChatMessageBubble>
      </ChatMessage>
    </ChatMessageList>
  );
}
