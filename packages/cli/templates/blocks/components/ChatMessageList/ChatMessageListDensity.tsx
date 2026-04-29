'use client';

import {
  XDSChatMessageList,
  XDSChatMessage,
  XDSChatMessageBubble,
} from '@xds/core/Chat';
import {XDSHStack, XDSVStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import {XDSAvatar} from '@xds/core/Avatar';
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  root: {
    height: 420,
  },
  column: {
    flex: 1,
    minWidth: 0,
  },
  list: {
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
    <XDSHStack gap={4} xstyle={styles.root}>
      {DENSITIES.map((density) => (
        <XDSVStack key={density} gap={2} xstyle={styles.column}>
          <XDSText type="supporting" color="secondary">
            {density}
          </XDSText>
          <XDSVStack xstyle={styles.list}>
            <XDSChatMessageList density={density}>
              <XDSChatMessage sender="user">
                <XDSChatMessageBubble>
                  How does density work?
                </XDSChatMessageBubble>
              </XDSChatMessage>
              <XDSChatMessage
                sender="assistant"
                avatar={<XDSAvatar name="Navi" size={AVATAR_SIZE[density]} />}>
                <XDSChatMessageBubble>
                  Density controls spacing at every level — gap between
                  messages, padding inside bubbles, and gap between child
                  elements.
                </XDSChatMessageBubble>
              </XDSChatMessage>
              <XDSChatMessage sender="user">
                <XDSChatMessageBubble>Makes sense!</XDSChatMessageBubble>
              </XDSChatMessage>
            </XDSChatMessageList>
          </XDSVStack>
        </XDSVStack>
      ))}
    </XDSHStack>
  );
}
