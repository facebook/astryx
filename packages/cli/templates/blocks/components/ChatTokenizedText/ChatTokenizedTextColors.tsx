// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {
  XDSChatTokenizedText,
  XDSChatMessage,
  XDSChatMessageBubble,
  XDSChatMessageList,
} from '@xds/core/Chat';

const mixedTokens = [
  {value: '@cindy', label: '@Cindy', variant: 'blue' as const},
  {value: '#bug', label: '#bug', variant: 'red' as const},
  {value: '#feat', label: '#feature', variant: 'green' as const},
];

export default function ChatTokenizedTextColors() {
  return (
    <XDSChatMessageList>
      <XDSChatMessage sender="system">
        <XDSChatMessageBubble>
          <XDSChatTokenizedText tokens={mixedTokens}>
            @cindy filed #bug and #feat for the sprint
          </XDSChatTokenizedText>
        </XDSChatMessageBubble>
      </XDSChatMessage>
    </XDSChatMessageList>
  );
}
