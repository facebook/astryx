// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {
  XDSChatMessageList,
  XDSChatMessage,
  XDSChatMessageBubble,
} from '@xds/core/Chat';
import {XDSVStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSDivider} from '@xds/core/Divider';
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
    <XDSVStack gap={4} style={{maxWidth: 500}}>
      {DENSITIES.map((density, index) => (
        <Fragment key={density}>
          {index > 0 && <XDSDivider />}
          <XDSVStack gap={2}>
            <XDSText type="supporting" color="secondary">
              {density.charAt(0).toUpperCase() + density.slice(1)}
            </XDSText>
            <XDSVStack xstyle={styles.section}>
              <XDSChatMessageList density={density}>
                <XDSChatMessage sender="user">
                  <XDSChatMessageBubble>
                    How does density work?
                  </XDSChatMessageBubble>
                </XDSChatMessage>
                <XDSChatMessage
                  sender="assistant"
                  avatar={
                    <XDSAvatar name="Agent" size={AVATAR_SIZE[density]} />
                  }>
                  <XDSChatMessageBubble>
                    Density provides default spacing at every level — message
                    gap, bubble padding, and gap between child elements. Use gap
                    to tune row spacing independently.
                  </XDSChatMessageBubble>
                </XDSChatMessage>
              </XDSChatMessageList>
            </XDSVStack>
          </XDSVStack>
        </Fragment>
      ))}
    </XDSVStack>
  );
}
