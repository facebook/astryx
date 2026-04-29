'use client';

import {
  XDSChatMessageList,
  XDSChatMessage,
  XDSChatMessageBubble,
  XDSChatSystemMessage,
} from '@xds/core/Chat';
import {XDSVStack} from '@xds/core/Layout';
import {XDSAvatar} from '@xds/core/Avatar';
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  container: {
    height: 400,
  },
});

export default function ChatMessageListSystemMessages() {
  return (
    <XDSVStack xstyle={styles.container}>
      <XDSChatMessageList>
        <XDSChatSystemMessage variant="divider">
          March 15, 2026
        </XDSChatSystemMessage>

        <XDSChatMessage
          sender="assistant"
          avatar={<XDSAvatar name="Navi" size="small" />}>
          <XDSChatMessageBubble>Good morning!</XDSChatMessageBubble>
        </XDSChatMessage>

        <XDSChatSystemMessage>Conversation started</XDSChatSystemMessage>

        <XDSChatMessage sender="user">
          <XDSChatMessageBubble>Hey Navi</XDSChatMessageBubble>
        </XDSChatMessage>

        <XDSChatSystemMessage variant="divider">Today</XDSChatSystemMessage>

        <XDSChatSystemMessage>Cindy shared a file</XDSChatSystemMessage>

        <XDSChatMessage sender="user">
          <XDSChatMessageBubble>Thanks for sharing!</XDSChatMessageBubble>
        </XDSChatMessage>
      </XDSChatMessageList>
    </XDSVStack>
  );
}
