// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {
  ChatMessageList,
  ChatMessage,
  ChatMessageBubble,
  ChatMessageMetadata,
} from '@astryxdesign/core/Chat';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {Text} from '@astryxdesign/core/Text';

export default function ChatMessageMultiBubble() {
  return (
    <ChatMessageList style={{maxWidth: 500}}>
      <ChatMessage sender="user">
        <ChatMessageBubble group="first">
          I have a couple of questions about the new API.
        </ChatMessageBubble>
        <ChatMessageBubble group="middle">
          First, how should we handle pagination?
        </ChatMessageBubble>
        <ChatMessageBubble
          group="last"
          metadata={
            <ChatMessageMetadata
              timestamp={
                <Timestamp value="2026-04-28T11:00:00" format="time" />
              }
              status="delivered"
            />
          }>
          And second, what's the rate limit?
        </ChatMessageBubble>
      </ChatMessage>
      <ChatMessage
        sender="assistant"
        avatar={<Avatar name="Agent" size="md" />}>
        <ChatMessageBubble
          group="first"
          name={
            <Text type="supporting" weight="semibold" color="secondary">
              Agent
            </Text>
          }>
          Great questions! For pagination, use cursor-based with a limit
          parameter. The response includes a nextCursor field.
        </ChatMessageBubble>
        <ChatMessageBubble
          group="last"
          metadata={
            <ChatMessageMetadata
              timestamp={
                <Timestamp value="2026-04-28T11:01:00" format="time" />
              }
            />
          }>
          Rate limit is 100 requests per minute per API key. You'll get a 429
          response with a Retry-After header if you exceed it.
        </ChatMessageBubble>
      </ChatMessage>
    </ChatMessageList>
  );
}
