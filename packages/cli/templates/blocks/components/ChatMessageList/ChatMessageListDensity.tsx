// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {
  ChatMessageList,
  ChatMessage,
  ChatMessageBubble,
} from '@astryxdesign/core/Chat';
import {VStack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Divider} from '@astryxdesign/core/Divider';
import {Fragment} from 'react';

const DENSITIES = ['compact', 'balanced', 'spacious'] as const;

const AVATAR_SIZE = {
  compact: 'sm' as const,
  balanced: 'md' as const,
  spacious: 'md' as const,
};

export default function ChatMessageListDensity() {
  return (
    <VStack gap={4} style={{maxWidth: 500}}>
      {DENSITIES.map((density, index) => (
        <Fragment key={density}>
          {index > 0 && <Divider />}
          <VStack gap={2}>
            <Text type="supporting" color="secondary">
              {density.charAt(0).toUpperCase() + density.slice(1)}
            </Text>
            <VStack style={{flex: 1, minHeight: 0}}>
              <ChatMessageList density={density}>
                <ChatMessage sender="user">
                  <ChatMessageBubble>How does density work?</ChatMessageBubble>
                </ChatMessage>
                <ChatMessage
                  sender="assistant"
                  avatar={<Avatar name="Agent" size={AVATAR_SIZE[density]} />}>
                  <ChatMessageBubble>
                    Density provides default spacing at every level — message
                    gap, bubble padding, and gap between child elements. Use gap
                    to tune row spacing independently.
                  </ChatMessageBubble>
                </ChatMessage>
              </ChatMessageList>
            </VStack>
          </VStack>
        </Fragment>
      ))}
    </VStack>
  );
}
