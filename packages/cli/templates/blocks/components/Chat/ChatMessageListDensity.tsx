'use client';

import {
  XDSChatMessageList,
  XDSChatMessage,
  XDSChatMessageBubble,
} from '@xds/core/Chat';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSMarkdown} from '@xds/core/Markdown';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

const DENSITIES = ['compact', 'balanced', 'spacious'] as const;

const AVATAR_SIZE = {
  compact: 'xsmall' as const,
  balanced: 'small' as const,
  spacious: 'small' as const,
};

function DensityColumn({density}: {density: (typeof DENSITIES)[number]}) {
  return (
    <XDSStack direction="vertical" gap={1}>
      <XDSText type="supporting" weight="semibold" color="secondary">
        {density.charAt(0).toUpperCase() + density.slice(1)}
      </XDSText>
      <XDSChatMessageList density={density}>
        <XDSChatMessage sender="user">
          <XDSChatMessageBubble>
            How does the density system work?
          </XDSChatMessageBubble>
        </XDSChatMessage>
        <XDSChatMessage
          sender="assistant"
          avatar={<XDSAvatar name="Navi" size={AVATAR_SIZE[density]} />}>
          <XDSMarkdown density="compact">{`Density controls **spacing** at every level — gap between messages, padding inside bubbles, and gap between child elements.

This is **${density}** density.`}</XDSMarkdown>
        </XDSChatMessage>
        <XDSChatMessage sender="user">
          <XDSChatMessageBubble>Makes sense, thanks!</XDSChatMessageBubble>
        </XDSChatMessage>
      </XDSChatMessageList>
    </XDSStack>
  );
}

export default function ChatMessageListDensity() {
  return (
    <XDSStack direction="horizontal" gap={3}>
      {DENSITIES.map(d => (
        <DensityColumn key={d} density={d} />
      ))}
    </XDSStack>
  );
}
