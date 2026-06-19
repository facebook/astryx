// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {
  ChatMessageList,
  ChatMessage,
  ChatMessageBubble,
  ChatMessageMetadata,
} from '@xds/core/Chat';
import {Timestamp} from '@xds/core/Timestamp';
import {Text} from '@xds/core/Text';

export default function ChatMessageShowcase() {
  return (
    <ChatMessageList style={{maxWidth: 600}}>
      <ChatMessage sender="user">
        <ChatMessageBubble group="first">
          I just pushed the refactored auth module.
        </ChatMessageBubble>
        <ChatMessageBubble
          group="last"
          metadata={
            <ChatMessageMetadata
              timestamp={
                <Timestamp value="2026-04-28T14:30:00" format="time" />
              }
              status="read"
            />
          }>
          Can you review the token validation changes?
        </ChatMessageBubble>
      </ChatMessage>
      <ChatMessage sender="assistant">
        <ChatMessageBubble
          variant="ghost"
          metadata={
            <ChatMessageMetadata
              timestamp={
                <Timestamp value="2026-04-28T14:31:00" format="time" />
              }
              footer={
                <Text type="supporting" color="secondary">
                  Claude Opus 4.6
                </Text>
              }
            />
          }>
          Looks good — the refresh token rotation is solid and the error
          handling covers all the edge cases. Ship it.
        </ChatMessageBubble>
      </ChatMessage>
    </ChatMessageList>
  );
}
