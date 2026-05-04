'use client';

import {
  XDSChatMessageList,
  XDSChatMessage,
  XDSChatMessageBubble,
  XDSChatMessageMetadata,
  XDSChatSystemMessage,
} from '@xds/core/Chat';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSMarkdown} from '@xds/core/Markdown';
import {XDSCodeBlock} from '@xds/core/CodeBlock';
import {XDSTimestamp} from '@xds/core/Timestamp';
import {XDSToken} from '@xds/core/Token';
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  container: {
    maxWidth: 500,
    justifyContent: 'center',
  },
});

export default function ChatMessageListFullFeatured() {
  return (
    <XDSVStack xstyle={styles.container}>
      <XDSChatMessageList>
        <XDSChatSystemMessage variant="divider">Today</XDSChatSystemMessage>

        <XDSChatMessage sender="user">
          <XDSHStack gap={2} wrap="wrap">
            <XDSToken label="useReducer.ts" />
            <XDSToken label="formState.ts" />
          </XDSHStack>
          <XDSChatMessageBubble
            metadata={
              <XDSChatMessageMetadata
                timestamp={
                  <XDSTimestamp value="2026-03-15T14:30:00" format="time" />
                }
                status="read"
              />
            }>
            Can you review these files?
          </XDSChatMessageBubble>
        </XDSChatMessage>

        <XDSChatMessage
          sender="assistant"
          avatar={<XDSAvatar name="Agent" size="small" />}>
          <XDSChatMessageBubble group="first">
            <XDSMarkdown density="compact">
              {`Sure! Here's the key pattern from **useReducer.ts**:`}
            </XDSMarkdown>
          </XDSChatMessageBubble>
          <XDSChatMessageBubble group="last">
            <XDSMarkdown density="compact">
              {`The reducer is **pure and easy to test** — pass in state and action, assert on the output.`}
            </XDSMarkdown>
          </XDSChatMessageBubble>
          <XDSChatMessageBubble
            variant="ghost"
            group="middle"
            metadata={
              <XDSChatMessageMetadata
                timestamp={
                  <XDSTimestamp value="2026-03-15T14:30:30" format="time" />
                }
              />
            }>
            <XDSCodeBlock
              code={`const [state, dispatch] = useReducer(
  (state, action) => ({
    ...state,
    [action.field]: action.value,
  }),
  { name: '', email: '' }
);`}
              language="tsx"
            />
          </XDSChatMessageBubble>
        </XDSChatMessage>

        <XDSChatSystemMessage>Agent shared a code snippet</XDSChatSystemMessage>

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
            That's clean, thanks!
          </XDSChatMessageBubble>
        </XDSChatMessage>
      </XDSChatMessageList>
    </XDSVStack>
  );
}
