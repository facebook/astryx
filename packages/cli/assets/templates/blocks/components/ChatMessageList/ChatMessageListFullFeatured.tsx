// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {
  ChatMessageList,
  ChatMessage,
  ChatMessageBubble,
  ChatMessageMetadata,
  ChatSystemMessage,
} from '@astryxdesign/core/Chat';
import {VStack, HStack} from '@astryxdesign/core/Layout';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Markdown} from '@astryxdesign/core/Markdown';
import {CodeBlock} from '@astryxdesign/core/CodeBlock';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {Token} from '@astryxdesign/core/Token';

export default function ChatMessageListFullFeatured() {
  return (
    <VStack style={{maxWidth: 500, justifyContent: 'center'}}>
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
          avatar={<Avatar name="Agent" size="md" />}>
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
