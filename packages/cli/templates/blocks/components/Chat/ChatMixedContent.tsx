'use client';

import {
  XDSChatMessageList,
  XDSChatMessage,
  XDSChatMessageBubble,
  XDSChatSystemMessage,
} from '@xds/core/Chat';
import {XDSMarkdown} from '@xds/core/Markdown';
import {XDSToken} from '@xds/core/Token';
import {XDSHStack} from '@xds/core/Stack';
import {XDSCodeBlock} from '@xds/core/CodeBlock';

export default function ChatMixedContent() {
  return (
    <div style={{height: 600, display: 'flex', flexDirection: 'column'}}>
      <XDSChatMessageList>
        <XDSChatMessage sender="user">
          <XDSChatMessageBubble>
            Show me the component files and explain the architecture
          </XDSChatMessageBubble>
        </XDSChatMessage>

        <XDSChatMessage sender="assistant">
          <XDSChatMessageBubble>
            Sure! Here's an overview of the component architecture.
          </XDSChatMessageBubble>
          <XDSChatMessageBubble variant="ghost">
            <XDSMarkdown density="compact">{`The system uses a **compound component** pattern with three layers:

1. **MessageList** — scrollable container with auto-scroll
2. **Message** — layout wrapper with sender context
3. **Bubble** — styled content container`}</XDSMarkdown>
          </XDSChatMessageBubble>
          <XDSChatMessageBubble variant="ghost">
            <XDSMarkdown density="compact">Here are the files:</XDSMarkdown>
            <XDSHStack gap={2} wrap="wrap">
              <XDSToken label="Button.tsx" />
              <XDSToken label="Card.tsx" />
              <XDSToken label="Dialog.tsx" />
            </XDSHStack>
            <XDSCodeBlock
              code={
                "export * from './Button';\nexport * from './Card';\nexport * from './Dialog';"
              }
              language="typescript"
            />
          </XDSChatMessageBubble>
          <XDSChatMessageBubble>
            Let me know which one to open — I can walk through the
            implementation.
          </XDSChatMessageBubble>
        </XDSChatMessage>

        <XDSChatMessage sender="user">
          <XDSChatMessageBubble>Open Button.tsx</XDSChatMessageBubble>
        </XDSChatMessage>

        <XDSChatSystemMessage>Navi opened Button.tsx</XDSChatSystemMessage>

        <XDSChatMessage sender="assistant">
          <XDSChatMessageBubble variant="ghost">
            <XDSCodeBlock
              code={`export function XDSButton({ label, variant = 'primary' }) {
  return (
    <button className={styles[variant]}>
      {label}
    </button>
  );
}`}
              language="tsx"
            />
            <XDSMarkdown density="compact">
              The Button reads variant from props and maps it to the matching
              style.
            </XDSMarkdown>
          </XDSChatMessageBubble>
        </XDSChatMessage>
      </XDSChatMessageList>
    </div>
  );
}
