'use client';

import {
  XDSChatLayout,
  XDSChatMessageList,
  XDSChatMessage,
  XDSChatMessageBubble,
  XDSChatComposer,
} from '@xds/core/Chat';
import {XDSMarkdown} from '@xds/core/Markdown';
import {XDSVStack} from '@xds/core/Layout';

export default function ChatLayoutShowcase() {
  return (
    <XDSVStack height={500}>
      <XDSChatLayout
        composer={
          <XDSChatComposer
            onSubmit={() => {}}
            placeholder="Ask about the codebase..."
          />
        }>
        <XDSChatMessageList>
          <XDSChatMessage sender="user">
            <XDSChatMessageBubble>
              Can you review the Button component?
            </XDSChatMessageBubble>
          </XDSChatMessage>
          <XDSChatMessage sender="assistant">
            <XDSMarkdown density="compact">{`The Button component looks solid. A few suggestions:

- Use the **theme token** for border-radius instead of a hardcoded value
- The focus ring meets **WCAG 2.4.7** requirements`}</XDSMarkdown>
          </XDSChatMessage>
        </XDSChatMessageList>
      </XDSChatLayout>
    </XDSVStack>
  );
}
