// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {
  ChatMessageList,
  ChatMessage,
  ChatMessageBubble,
} from '@xds/core/Chat';
import {VStack} from '@xds/core/Layout';
import {Text} from '@xds/core/Text';
import {Avatar} from '@xds/core/Avatar';
import {Divider} from '@xds/core/Divider';
import {Fragment} from 'react';
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  section: {
    flex: 1,
    minHeight: 0,
  },
});

const DENSITIES = ['compact', 'balanced', 'spacious'] as const;

const AVATAR_SIZE = {
  compact: 'xsmall' as const,
  balanced: 'small' as const,
  spacious: 'small' as const,
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
            <VStack xstyle={styles.section}>
              <ChatMessageList density={density}>
                <ChatMessage sender="user">
                  <ChatMessageBubble>
                    How does density work?
                  </ChatMessageBubble>
                </ChatMessage>
                <ChatMessage
                  sender="assistant"
                  avatar={
                    <Avatar name="Agent" size={AVATAR_SIZE[density]} />
                  }>
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
