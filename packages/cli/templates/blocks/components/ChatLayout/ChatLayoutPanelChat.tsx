// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {
  ChatLayout,
  ChatMessageList,
  ChatMessage,
  ChatMessageBubble,
  ChatSystemMessage,
  ChatComposer,
} from '@xds/core/Chat';
import {Markdown} from '@xds/core/Markdown';
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
      <ChatLayout
        composer={
          <ChatComposer onSubmit={() => {}} placeholder="Ask something..." />
        }>
        <ChatMessageList>
          <ChatSystemMessage variant="divider">Today</ChatSystemMessage>

          <ChatMessage sender="user">
            <ChatMessageBubble>
              Can you review the Button component and fix the focus ring?
            </ChatMessageBubble>
          </ChatMessage>

          <ChatMessage sender="assistant">
            <Markdown density="compact">{`I'll check the Button component now.

Found the issue — the border radius was hardcoded. Replaced with the theme token.`}</Markdown>
          </ChatMessage>

          <ChatMessage sender="user">
            <ChatMessageBubble>
              Nice, can you also check the Card component?
            </ChatMessageBubble>
          </ChatMessage>

          <ChatMessage sender="assistant">
            <Markdown density="compact">{`Checking the component now.

Found the issue — the border radius was hardcoded. Replaced with the theme token.`}</Markdown>
          </ChatMessage>
        </ChatMessageList>
      </ChatLayout>
    </div>
  );
}
