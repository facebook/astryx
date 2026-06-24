// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {
  ChatTokenizedText,
  ChatMessage,
  ChatMessageBubble,
  ChatMessageList,
} from '@astryxdesign/core/Chat';

const tokens = [
  {value: '@cindy', label: '@Cindy', variant: 'blue' as const},
  {value: '@alex', label: '@Alex', variant: 'blue' as const},
];

export default function ChatTokenizedTextBasic() {
  return (
    <ChatMessageList>
      <ChatMessage sender="system">
        <ChatMessageBubble>
          <ChatTokenizedText tokens={tokens}>
            Assign @cindy and @alex as reviewers.
          </ChatTokenizedText>
        </ChatMessageBubble>
      </ChatMessage>
    </ChatMessageList>
  );
}
