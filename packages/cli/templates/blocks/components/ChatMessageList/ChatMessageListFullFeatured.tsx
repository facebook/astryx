'use client';

import {
  XDSChatMessageList,
  XDSChatMessage,
  XDSChatMessageBubble,
  XDSChatMessageMetadata,
  XDSChatSystemMessage,
} from '@xds/core/Chat';
import {XDSVStack} from '@xds/core/Layout';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSMarkdown} from '@xds/core/Markdown';
import {XDSCodeBlock} from '@xds/core/CodeBlock';
import {XDSTimestamp} from '@xds/core/Timestamp';
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  container: {
    maxWidth: 600,
    height: '100%',
  },
});

export default function ChatMessageListFullFeatured() {
  return (
    <XDSVStack xstyle={styles.container}>
      <XDSChatMessageList>
        <XDSChatSystemMessage variant="divider">Today</XDSChatSystemMessage>

        <XDSChatMessage sender="user">
          <XDSChatMessageBubble
            group="first"
            metadata={
              <XDSChatMessageMetadata
                timestamp={
                  <XDSTimestamp value="2026-03-15T14:30:00" format="time" />
                }
                status="read"
              />
            }>
            Can you show me a useReducer example?
          </XDSChatMessageBubble>
        </XDSChatMessage>

        <XDSChatMessage
          sender="assistant"
          avatar={<XDSAvatar name="Navi" size="small" />}>
          <XDSChatMessageBubble group="first">
            <XDSMarkdown density="compact">
              {`Sure! Here's a common pattern for form state:`}
            </XDSMarkdown>
          </XDSChatMessageBubble>
          <XDSChatMessageBubble variant="ghost" group="middle">
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
          <XDSChatMessageBubble
            group="last"
            metadata={
              <XDSChatMessageMetadata
                timestamp={
                  <XDSTimestamp value="2026-03-15T14:30:30" format="time" />
                }
              />
            }>
            <XDSMarkdown density="compact">
              {`The reducer is **pure and easy to test** — just pass in state and action, assert on the output.`}
            </XDSMarkdown>
          </XDSChatMessageBubble>
        </XDSChatMessage>

        <XDSChatSystemMessage>Navi shared a code snippet</XDSChatSystemMessage>

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
