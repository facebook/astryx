// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {ChatMessageList, ChatSystemMessage} from '@xds/core/Chat';

export default function ChatSystemMessageShowcase() {
  return (
    <ChatMessageList>
      <ChatSystemMessage variant="divider">
        March 15, 2026
      </ChatSystemMessage>
      <ChatSystemMessage>Alex joined the conversation</ChatSystemMessage>
      <ChatSystemMessage>Agent is thinking…</ChatSystemMessage>
      <ChatSystemMessage variant="divider">Today</ChatSystemMessage>
      <ChatSystemMessage>
        Conversation marked as resolved
      </ChatSystemMessage>
    </ChatMessageList>
  );
}
