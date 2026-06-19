// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {
  ChatMessageList,
  ChatMessage,
  ChatMessageBubble,
  ChatMessageMetadata,
  ChatSystemMessage,
} from '@xds/core/Chat';
import {VStack, HStack} from '@xds/core/Layout';
import {Avatar} from '@xds/core/Avatar';
import {Markdown} from '@xds/core/Markdown';
import {CodeBlock} from '@xds/core/CodeBlock';
import {Timestamp} from '@xds/core/Timestamp';
import {Token} from '@xds/core/Token';
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  container: {
    maxWidth: 500,
    justifyContent: 'center',
  },
});

export default function ChatMessageListFullFeatured() {
  return (
    <VStack xstyle={styles.container}>
      <ChatMessageList>
        <ChatSystemMessage variant="divider">Today</ChatSystemMessage>

        <ChatMessage sender="user">
          <HStack gap={2} wrap="wrap">
            <Token label="useReducer.ts" />
            <Token label="formState.ts" />
          </HStack>
          <ChatMessageBubble
            metadata={
              <ChatMessageMetadata
                timestamp={
                  <Timestamp value="2026-03-15T14:30:00" format="time" />
                }
                status="read"
              />
            }>
            Can you review these files?
          </ChatMessageBubble>
        </ChatMessage>

        <ChatMessage
          sender="assistant"
          avatar={<Avatar name="Agent" size="small" />}>
          <ChatMessageBubble group="first">
            <Markdown density="compact">
              {`Sure! Here's the key pattern from **useReducer.ts**:`}
            </Markdown>
          </ChatMessageBubble>
          <ChatMessageBubble group="last">
            <Markdown density="compact">
              {`The reducer is **pure and easy to test** — pass in state and action, assert on the output.`}
            </Markdown>
          </ChatMessageBubble>
          <ChatMessageBubble
            variant="ghost"
            group="middle"
            metadata={
              <ChatMessageMetadata
                timestamp={
                  <Timestamp value="2026-03-15T14:30:30" format="time" />
                }
              />
            }>
            <CodeBlock
              code={`const [state, dispatch] = useReducer(
  (state, action) => ({
    ...state,
    [action.field]: action.value,
  }),
  { name: '', email: '' }
);`}
              language="tsx"
            />
          </ChatMessageBubble>
        </ChatMessage>

        <ChatSystemMessage>Agent shared a code snippet</ChatSystemMessage>

        <ChatMessage sender="user">
          <ChatMessageBubble
            metadata={
              <ChatMessageMetadata
                timestamp={
                  <Timestamp value="2026-03-15T14:31:00" format="time" />
                }
                status="delivered"
              />
            }>
            That's clean, thanks!
          </ChatMessageBubble>
        </ChatMessage>
      </ChatMessageList>
    </VStack>
  );
}
