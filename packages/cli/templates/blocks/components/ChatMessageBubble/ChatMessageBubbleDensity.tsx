// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {
  ChatMessageList,
  ChatMessage,
  ChatMessageBubble,
} from '@astryxdesign/core/Chat';
import {Text} from '@astryxdesign/core/Text';
import {VStack} from '@astryxdesign/core/Layout';

const DENSITIES = [
  {density: 'compact' as const, label: 'Compact'},
  {density: 'balanced' as const, label: 'Balanced'},
  {density: 'spacious' as const, label: 'Spacious'},
];

export default function ChatMessageBubbleDensity() {
  return (
    <VStack gap={5} style={{width: '100%', maxWidth: 400}}>
      {DENSITIES.map(({density, label}) => (
        <VStack key={density} gap={1}>
          <Text type="supporting" color="secondary">
            {label}
          </Text>
          <ChatMessageList density={density}>
            <ChatMessage sender="assistant">
              <ChatMessageBubble>
                The build completed in 4.2 seconds.
              </ChatMessageBubble>
            </ChatMessage>
            <ChatMessage sender="user">
              <ChatMessageBubble>Ship it to staging.</ChatMessageBubble>
            </ChatMessage>
          </ChatMessageList>
        </VStack>
      ))}
    </VStack>
  );
}
