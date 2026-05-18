// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {
  XDSChatMessageList,
  XDSChatMessage,
  XDSChatMessageBubble,
  XDSChatMessageMetadata,
  XDSChatSystemMessage,
} from '@xds/core/Chat';
import {XDSVStack} from '@xds/core/Layout';
import {XDSTimestamp} from '@xds/core/Timestamp';
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  container: {
    maxWidth: 600,
    height: '100%',
  },
});

export default function ChatMessageListShowcase() {
  return (
    <XDSVStack xstyle={styles.container}>
      <XDSChatMessageList density="balanced">
        <XDSChatSystemMessage variant="divider">
          March 15, 2026
        </XDSChatSystemMessage>

        <XDSChatMessage sender="user">
          <XDSChatMessageBubble
            metadata={
              <XDSChatMessageMetadata
                timestamp={
                  <XDSTimestamp value="2026-03-15T14:30:00" format="time" />
                }
                status="read"
              />
            }>
            How should I structure a monorepo?
          </XDSChatMessageBubble>
        </XDSChatMessage>

        <XDSChatMessage sender="assistant">
          <XDSChatMessageBubble
            metadata={
              <XDSChatMessageMetadata
                timestamp={
                  <XDSTimestamp value="2026-03-15T14:30:15" format="time" />
                }
              />
            }>
            Use workspaces with a shared packages directory. Keep each package
            focused on a single concern.
          </XDSChatMessageBubble>
        </XDSChatMessage>

        <XDSChatMessage sender="user">
          <XDSChatMessageBubble
            metadata={
              <XDSChatMessageMetadata
                timestamp={
                  <XDSTimestamp value="2026-03-15T14:31:00" format="time" />
                }
                status="delivered"
              />
            }>
            Should I use Yarn or pnpm for that?
          </XDSChatMessageBubble>
        </XDSChatMessage>
      </XDSChatMessageList>
    </XDSVStack>
  );
}
