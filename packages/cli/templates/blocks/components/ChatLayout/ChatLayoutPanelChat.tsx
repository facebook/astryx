// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {
  XDSChatLayout,
  XDSChatMessageList,
  XDSChatMessage,
  XDSChatMessageBubble,
  XDSChatSystemMessage,
  XDSChatComposer,
} from '@xds/core/Chat';
import {XDSMarkdown} from '@xds/core/Markdown';
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  panel: {
    width: 450,
    height: 600,
    borderRadius: 8,
    overflow: 'hidden',
    border: '1px solid var(--color-border)',
  },
});

export default function ChatLayoutPanelChat() {
  return (
    <div {...stylex.props(styles.panel)}>
      <XDSChatLayout
        composer={
          <XDSChatComposer onSubmit={() => {}} placeholder="Ask something..." />
        }>
        <XDSChatMessageList>
          <XDSChatSystemMessage variant="divider">Today</XDSChatSystemMessage>

          <XDSChatMessage sender="user">
            <XDSChatMessageBubble>
              Can you review the Button component and fix the focus ring?
            </XDSChatMessageBubble>
          </XDSChatMessage>

          <XDSChatMessage sender="assistant">
            <XDSMarkdown density="compact">{`I'll check the Button component now.

Found the issue — the border radius was hardcoded. Replaced with the theme token.`}</XDSMarkdown>
          </XDSChatMessage>

          <XDSChatMessage sender="user">
            <XDSChatMessageBubble>
              Nice, can you also check the Card component?
            </XDSChatMessageBubble>
          </XDSChatMessage>

          <XDSChatMessage sender="assistant">
            <XDSMarkdown density="compact">{`Checking the component now.

Found the issue — the border radius was hardcoded. Replaced with the theme token.`}</XDSMarkdown>
          </XDSChatMessage>
        </XDSChatMessageList>
      </XDSChatLayout>
    </div>
  );
}
