// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {
  ChatTokenizedText,
  ChatMessage,
  ChatMessageBubble,
  ChatMessageList,
} from '@xds/core/Chat';

const mixedTokens = [
  {value: '@cindy', label: '@Cindy', variant: 'blue' as const},
  {value: '#bug', label: '#bug', variant: 'red' as const},
  {value: '#feat', label: '#feature', variant: 'green' as const},
];

export default function ChatTokenizedTextShowcase() {
  return (
    <ChatMessageList>
      <ChatMessage sender="system">
        <ChatMessageBubble>
          <ChatTokenizedText tokens={mixedTokens}>
            @cindy filed #bug and #feat for the sprint
          </ChatTokenizedText>
        </ChatMessageBubble>
      </ChatMessage>
    </ChatMessageList>
  );
}
