'use client';

import {
  XDSChatMessageList,
  XDSChatMessage,
  XDSChatMessageBubble,
} from '@xds/core/Chat';
import {XDSText} from '@xds/core/Text';
import {XDSVStack} from '@xds/core/Layout';

const DENSITIES = [
  {density: 'compact' as const, label: 'Compact'},
  {density: 'balanced' as const, label: 'Balanced'},
  {density: 'spacious' as const, label: 'Spacious'},
];

export default function ChatMessageBubbleDensity() {
  return (
    <XDSVStack gap={5} style={{width: '100%', maxWidth: 400}}>
      {DENSITIES.map(({density, label}) => (
        <XDSVStack key={density} gap={1}>
          <XDSText type="supporting" color="secondary">
            {label}
          </XDSText>
          <XDSChatMessageList density={density}>
            <XDSChatMessage sender="assistant">
              <XDSChatMessageBubble>
                The build completed in 4.2 seconds.
              </XDSChatMessageBubble>
            </XDSChatMessage>
            <XDSChatMessage sender="user">
              <XDSChatMessageBubble>Ship it to staging.</XDSChatMessageBubble>
            </XDSChatMessage>
          </XDSChatMessageList>
        </XDSVStack>
      ))}
    </XDSVStack>
  );
}
