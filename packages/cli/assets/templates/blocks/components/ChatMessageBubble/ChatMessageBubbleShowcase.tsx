// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {
  ChatMessageList,
  ChatMessage,
  ChatMessageBubble,
  ChatMessageMetadata,
} from '@astryxdesign/core/Chat';
import {Timestamp} from '@astryxdesign/core/Timestamp';

export default function ChatMessageBubbleShowcase() {
  return (
    <ChatMessageList style={{maxWidth: 600}}>
      <ChatMessage sender="user">
        <ChatMessageBubble group="first">
          I just pushed the latest changes to the feature branch.
        </ChatMessageBubble>
        <ChatMessageBubble
          group="last"
          metadata={
            <ChatMessageMetadata
              timestamp={
                <Timestamp value="2026-04-10T09:15:00" format="time" />
              }
              status="read"
            />
          }>
          Can you review when you get a chance?
        </ChatMessageBubble>
      </ChatMessage>
      <ChatMessage sender="assistant">
        <ChatMessageBubble
          variant="ghost"
          metadata={
            <ChatMessageMetadata
              timestamp={
                <Timestamp value="2026-04-10T09:16:00" format="time" />
              }
            />
          }>
          The changes look great. Ship it!
        </ChatMessageBubble>
      </ChatMessage>
    </ChatMessageList>
  );
}
