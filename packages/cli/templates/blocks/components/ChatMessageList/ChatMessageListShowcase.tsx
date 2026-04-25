'use client';

import {
  XDSChatMessageList,
  XDSChatMessage,
  XDSChatMessageBubble,
  XDSChatSystemMessage,
} from '@xds/core/Chat';
import {XDSVStack} from '@xds/core/Layout';
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  container: {
    height: 400,
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
          <XDSChatMessageBubble>
            What's the best way to structure a monorepo?
          </XDSChatMessageBubble>
        </XDSChatMessage>

        <XDSChatMessage sender="assistant">
          <XDSChatMessageBubble>
            I'd recommend using workspaces with a shared packages directory.
            Keep each package focused on a single concern.
          </XDSChatMessageBubble>
        </XDSChatMessage>

        <XDSChatMessage sender="user">
          <XDSChatMessageBubble>
            Should I use Yarn or pnpm workspaces?
          </XDSChatMessageBubble>
        </XDSChatMessage>

        <XDSChatMessage sender="assistant">
          <XDSChatMessageBubble>
            Both work well. Yarn is more mature, pnpm is faster with better
            disk efficiency. Pick whichever your team is comfortable with.
          </XDSChatMessageBubble>
        </XDSChatMessage>
      </XDSChatMessageList>
    </XDSVStack>
  );
}
