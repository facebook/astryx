'use client';

import {
  XDSChatLayout,
  XDSChatMessageList,
  XDSChatMessage,
  XDSChatMessageBubble,
  XDSChatComposer,
} from '@xds/core/Chat';
import {XDSMarkdown} from '@xds/core/Markdown';

export default function ChatLayoutShowcase() {
  return (
    <div style={{height: 500, display: 'flex', flexDirection: 'column'}}>
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
    </div>
  );
}
