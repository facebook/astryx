'use client';

import {
  XDSChatLayout,
  XDSChatMessageList,
  XDSChatMessage,
  XDSChatMessageBubble,
  XDSChatMessageMetadata,
  XDSChatSystemMessage,
  XDSChatComposer,
  XDSChatToolCalls,
} from '@xds/core/Chat';
import {XDSMarkdown} from '@xds/core/Markdown';
import {XDSTimestamp} from '@xds/core/Timestamp';
import {XDSButton} from '@xds/core/Button';
import {XDSCodeBlock} from '@xds/core/CodeBlock';

export default function ChatLayoutFullAIChat() {
  return (
    <div style={{height: '100vh', display: 'flex', flexDirection: 'column'}}>
      <XDSChatLayout
        composer={
          <XDSChatComposer
            onSubmit={() => {}}
            placeholder="Ask about the codebase..."
            footerActions={
              <XDSButton label="Claude Opus" variant="ghost" size="md" />
            }
          />
        }>
        <XDSChatMessageList>
          <XDSChatSystemMessage variant="divider">Today</XDSChatSystemMessage>

          <XDSChatMessage sender="user">
            <XDSChatMessageBubble
              metadata={
                <XDSChatMessageMetadata
                  timestamp={
                    <XDSTimestamp value="2026-03-15T14:30:00" format="time" />
                  }
                  status="read"
                />
              }>
              Can you review the Button component and fix the focus ring?
            </XDSChatMessageBubble>
          </XDSChatMessage>

          <XDSChatMessage sender="assistant">
            <XDSMarkdown density="compact">
              I'll read the Button component and check the focus styles.
            </XDSMarkdown>
            <XDSChatToolCalls
              calls={[
                {
                  key: '1',
                  name: 'read',
                  target: 'XDSButton.tsx',
                  status: 'complete',
                  duration: '45ms',
                  node: 'xds',
                },
                {
                  key: '2',
                  name: 'edit',
                  target: 'XDSButton.tsx',
                  status: 'complete',
                  duration: '120ms',
                  node: 'xds',
                  additions: 8,
                  deletions: 2,
                  resultDetail: (
                    <XDSCodeBlock
                      code={`:focus-visible {\n  outline: 2px solid var(--color-ring-focus);\n  outline-offset: 2px;\n}`}
                      language="css"
                    />
                  ),
                },
                {
                  key: '3',
                  name: 'bash',
                  target: 'yarn test',
                  status: 'complete',
                  duration: '6.1s',
                  node: 'xds',
                  resultDetail: (
                    <XDSCodeBlock
                      code={`$ yarn test\n✓ 24 tests passed (3 suites)`}
                      language="bash"
                    />
                  ),
                },
              ]}
            />
            <XDSMarkdown density="compact">{`Added a \`:focus-visible\` style with a 2px solid outline and 2px offset. All 24 Button tests pass.

The focus ring meets **WCAG 2.4.7** requirements and uses the theme's focus color token.`}</XDSMarkdown>
            <XDSChatMessageMetadata
              timestamp={
                <XDSTimestamp value="2026-03-15T14:31:00" format="time" />
              }
              footer={<span>Claude Opus 4.6</span>}
            />
          </XDSChatMessage>

          <XDSChatMessage sender="user">
            <XDSChatMessageBubble
              metadata={
                <XDSChatMessageMetadata
                  timestamp={
                    <XDSTimestamp value="2026-03-15T14:35:00" format="time" />
                  }
                  status="read"
                />
              }>
              Nice, can you also check the Card component?
            </XDSChatMessageBubble>
          </XDSChatMessage>
        </XDSChatMessageList>
      </XDSChatLayout>
    </div>
  );
}
