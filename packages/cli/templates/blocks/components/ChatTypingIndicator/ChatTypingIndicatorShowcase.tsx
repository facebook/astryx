// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {
  ChatMessageList,
  ChatMessage,
  ChatMessageBubble,
  ChatUnreadDivider,
  ChatTypingIndicator,
} from '@astryxdesign/core/Chat';

export default function ChatTypingIndicatorShowcase() {
  return (
    <ChatMessageList style={{maxWidth: 600}}>
      <ChatMessage sender="user">
        <ChatMessageBubble>
          Sounds good — I&apos;ll take the migration notes.
        </ChatMessageBubble>
      </ChatMessage>
      <ChatUnreadDivider />
      <ChatMessage sender="assistant">
        <ChatMessageBubble>
          Perfect. I&apos;ve drafted the rollout checklist and shared it with
          the team.
        </ChatMessageBubble>
      </ChatMessage>
      <ChatTypingIndicator names={['Ana', 'Ben', 'Casey']} />
    </ChatMessageList>
  );
}
