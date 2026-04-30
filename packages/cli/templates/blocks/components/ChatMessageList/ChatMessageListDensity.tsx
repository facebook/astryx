'use client';

import {
  XDSChatMessageList,
  XDSChatMessage,
  XDSChatMessageBubble,
} from '@xds/core/Chat';
import {XDSVStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import {XDSAvatar} from '@xds/core/Avatar';
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
    <XDSVStack gap={4}>
      {DENSITIES.map(density => (
        <XDSVStack key={density} gap={2}>
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
                avatar={<XDSAvatar name="Agent" size={AVATAR_SIZE[density]} />}>
                <XDSChatMessageBubble>
                  Density controls spacing at every level — gap between
                  messages, padding inside bubbles, and gap between child
                  elements.
                </XDSChatMessageBubble>
              </XDSChatMessage>
            </XDSChatMessageList>
          </XDSVStack>
        </XDSVStack>
      ))}
    </XDSVStack>
  );
}
