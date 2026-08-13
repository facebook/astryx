// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {
  ChatMessageList,
  ChatMessage,
  ChatMessageBubble,
  ChatMessageMetadata,
} from '@astryxdesign/core/Chat';
import {Timestamp} from '@astryxdesign/core/Timestamp';

export default function ChatMessageMetadataTimestamp() {
  return (
    <ChatMessageList style={{maxWidth: 500}}>
      <ChatMessage sender="user">
        <ChatMessageBubble
          metadata={
            <ChatMessageMetadata
              timestamp={
                <Timestamp value="2026-04-29T14:30:00" format="time" />
              }
            />
          }>
          Thanks — any blockers I should know about?
        </ChatMessageBubble>
      </ChatMessage>
      <ChatMessage sender="assistant">
        <ChatMessageBubble
          metadata={
            <ChatMessageMetadata
              timestamp={
                <Timestamp value="2026-04-28T16:45:00" format="relative" />
              }
            />
          }>
          Relative timestamps work too — helpful for older messages where the
          exact time matters less than recency.
        </ChatMessageBubble>
      </ChatMessage>
    </ChatMessageList>
  );
}
