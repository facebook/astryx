import type {Meta, StoryObj} from '@storybook/react';
import {
  XDSChatMessageList,
  XDSChatMessage,
  XDSChatMessageBubble,
  XDSChatSystemMessage,
  XDSChatComposer,
  XDSChatComposerAttachments,
  XDSChatComposerInput,
  XDSChatMessageTokenizedText,
  XDSChatToolCalls,
  type XDSChatComposerInputHandle,
  type XDSChatComposerTrigger,
  type XDSChatToolCallItem,
} from '@xds/core/Chat';
import {XDSMarkdown} from '@xds/core/Markdown';
import {XDSToken} from '@xds/core/Token';
import {XDSButton} from '@xds/core/Button';
import {XDSCodeBlock} from '@xds/core/CodeBlock';
import {XDSProgressBar} from '@xds/core/ProgressBar';
import {useXDSTooltip} from '@xds/core/Tooltip';
import {createStaticSource} from '@xds/core/Typeahead';
import {useState, useCallback, useRef} from 'react';

const meta: Meta = {
  title: 'Chat/Compositions',
  tags: ['autodocs'],
  parameters: {layout: 'fullscreen'},
};
export default meta;

// Icons
const PaperclipIcon = (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round">
    <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
  </svg>
);
const AtSignIcon = (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round">
    <circle cx="12" cy="12" r="4" />
    <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" />
  </svg>
);
const MicIcon = (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" x2="12" y1="19" y2="22" />
  </svg>
);

// Data
const CONTACTS = [
  {id: 'cindy', label: 'Cindy Zhang'},
  {id: 'alex', label: 'Alex Rivera'},
  {id: 'sam', label: 'Sam Chen'},
  {id: 'navi', label: 'Navi'},
];
const COMMANDS = [
  {id: 'summarize', label: 'summarize'},
  {id: 'search', label: 'search'},
  {id: 'explain', label: 'explain'},
];

type Message =
  | {id: number; role: 'user'; text: string; files?: string[]}
  | {
      id: number;
      role: 'assistant';
      text: string;
      toolCalls?: XDSChatToolCallItem[];
      isStreaming?: boolean;
    }
  | {id: number; role: 'system'; text: string};

const SEED_MESSAGES: Message[] = [
  {id: 1, role: 'system', text: 'Today'},
  {
    id: 2,
    role: 'user',
    text: 'Can you review the Button component and fix the focus ring?',
  },
  {
    id: 3,
    role: 'assistant',
    text: "I'll read the Button component and check the focus styles.",
    toolCalls: [
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
    ],
  },
  {
    id: 4,
    role: 'assistant',
    text: "Added a `:focus-visible` style with a 2px solid outline and 2px offset. All 24 Button tests pass.\n\n```css\n:focus-visible {\n  outline: 2px solid var(--color-ring-focus);\n  outline-offset: 2px;\n}\n```\n\nHere's the test breakdown:\n\n| Suite | Tests | Duration | Status |\n|-------|-------|----------|--------|\n| XDSButton.test.tsx | 18 | 1.2s | ✓ Pass |\n| XDSButton.a11y.test.tsx | 4 | 0.8s | ✓ Pass |\n| XDSButton.snapshot.test.tsx | 2 | 0.3s | ✓ Pass |\n\nThe focus ring meets **WCAG 2.4.7** requirements and uses the theme's focus color token.",
  },
  {id: 5, role: 'user', text: 'Nice, can you also check the Card component?'},
];

/** Full AI chat — message list + composer with streaming, tool calls, triggers, attachments, and interactive modals */
export const FullAIChat: StoryObj = {
  name: 'Full AI Chat',
  render: () => {
    const [messages, setMessages] = useState<Message[]>(SEED_MESSAGES);
    const [files, setFiles] = useState<string[]>([]);
    const [isStreaming, setIsStreaming] = useState(false);
    const streamRef = useRef<ReturnType<typeof setInterval>>(undefined);
    const inputRef = useRef<XDSChatComposerInputHandle>(null);
    const contextTooltip = useXDSTooltip({placement: 'above'});

    // Token configs for rendering mentions in message bubbles
    const mentionTokens = CONTACTS.map(c => ({
      pattern: `@${c.id}`,
      label: `@${c.label}`,
      variant: 'blue' as const,
    }));

    const triggers: XDSChatComposerTrigger[] = [
      {
        character: '@',
        searchSource: createStaticSource(CONTACTS),
        onSelect: item => ({
          value: `@${item.id}`,
          label: `@${item.label}`,
          variant: 'blue' as const,
        }),
      },
      {
        character: '/',
        searchSource: createStaticSource(COMMANDS),
        onSelect: item => `/${item.label} `,
      },
    ];

    // Simulates: stream intro text → run tool calls → stream result text
    const streamResponse = useCallback(
      (
        introText: string,
        resultText: string,
        toolCalls?: XDSChatToolCallItem[],
      ) => {
        const msgId = Date.now();
        setIsStreaming(true);

        // Start with empty message
        setMessages(prev => [
          ...prev,
          {
            id: msgId,
            role: 'assistant',
            text: '',
            isStreaming: true,
          },
        ]);

        // Phase 1: stream intro text
        let i = 0;
        streamRef.current = setInterval(() => {
          i += 2 + Math.floor(Math.random() * 4);
          if (i >= introText.length) {
            clearInterval(streamRef.current);
            setMessages(prev =>
              prev.map(m => (m.id === msgId ? {...m, text: introText} : m)),
            );

            // Phase 2: tool calls appear as running
            if (toolCalls) {
              setTimeout(() => {
                setMessages(prev =>
                  prev.map(m =>
                    m.id === msgId && m.role === 'assistant'
                      ? {
                          ...m,
                          toolCalls: toolCalls.map(tc => ({
                            ...tc,
                            status: 'running' as const,
                            duration: undefined,
                          })),
                        }
                      : m,
                  ),
                );

                // Phase 2b: tool calls complete
                setTimeout(() => {
                  setMessages(prev =>
                    prev.map(m =>
                      m.id === msgId && m.role === 'assistant'
                        ? {...m, toolCalls}
                        : m,
                    ),
                  );

                  // Phase 3: stream result text
                  setTimeout(() => {
                    let j = 0;
                    const fullText = introText + '\n\n' + resultText;
                    streamRef.current = setInterval(() => {
                      j += 3 + Math.floor(Math.random() * 5);
                      const end = introText.length + 2 + j;
                      if (end >= fullText.length) {
                        clearInterval(streamRef.current);
                        setMessages(prev =>
                          prev.map(m =>
                            m.id === msgId
                              ? {...m, text: fullText, isStreaming: false}
                              : m,
                          ),
                        );
                        setIsStreaming(false);
                        return;
                      }
                      setMessages(prev =>
                        prev.map(m =>
                          m.id === msgId
                            ? {...m, text: fullText.slice(0, end)}
                            : m,
                        ),
                      );
                    }, 30);
                  }, 300);
                }, 1800);
              }, 400);
            } else {
              // No tool calls — just finish
              setMessages(prev =>
                prev.map(m =>
                  m.id === msgId ? {...m, isStreaming: false} : m,
                ),
              );
              setIsStreaming(false);
            }
            return;
          }
          setMessages(prev =>
            prev.map(m =>
              m.id === msgId ? {...m, text: introText.slice(0, i)} : m,
            ),
          );
        }, 30);
      },
      [],
    );

    const handleSubmit = useCallback(
      (value: string) => {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now(),
            role: 'user',
            text: value,
            files: files.length ? [...files] : undefined,
          },
        ]);
        setFiles([]);
        setTimeout(() => {
          streamResponse(
            "I'll check the Card component for the same issue.",
            'The border radius was hardcoded. I replaced it with the theme token:\n\n```css\n/* before */\nborder-radius: 12px;\n\n/* after */\nborder-radius: var(--radius-element);\n```\n\nCards now adapt across themes. All tests pass.',
            [
              {
                key: 'r1',
                name: 'read',
                target: 'XDSCard.tsx',
                status: 'complete',
                duration: '35ms',
                node: 'xds',
              },
              {
                key: 'e1',
                name: 'edit',
                target: 'XDSCard.tsx',
                status: 'complete',
                duration: '90ms',
                node: 'xds',
                additions: 1,
                deletions: 1,
              },
              {
                key: 't1',
                name: 'bash',
                target: 'yarn test --filter Card',
                status: 'complete',
                duration: '3.2s',
                node: 'xds',
              },
            ],
          );
        }, 800);
      },
      [files, streamResponse],
    );

    const handleStop = useCallback(() => {
      clearInterval(streamRef.current);
      setIsStreaming(false);
      setMessages(prev =>
        prev.map(m =>
          m.role === 'assistant' && m.isStreaming
            ? {...m, isStreaming: false}
            : m,
        ),
      );
    }, []);

    return (
      <>
        <div
          style={{
            maxWidth: 800,
            margin: '0 auto',
            paddingBottom: 120,
          }}>
          <XDSChatMessageList>
            {messages.map(msg => {
              if (msg.role === 'system') {
                return (
                  <XDSChatSystemMessage key={msg.id} variant="divider">
                    {msg.text}
                  </XDSChatSystemMessage>
                );
              }
              if (msg.role === 'user') {
                return (
                  <XDSChatMessage key={msg.id} sender="user">
                    {msg.files && (
                      <XDSChatComposerAttachments>
                        {msg.files.map(f => (
                          <XDSToken key={f} label={f} />
                        ))}
                      </XDSChatComposerAttachments>
                    )}
                    <XDSChatMessageBubble>
                      <XDSChatMessageTokenizedText tokens={mentionTokens}>
                        {msg.text}
                      </XDSChatMessageTokenizedText>
                    </XDSChatMessageBubble>
                  </XDSChatMessage>
                );
              }
              return (
                <XDSChatMessage key={msg.id} sender="assistant">
                  {msg.text && (
                    <XDSMarkdown density="compact">{msg.text}</XDSMarkdown>
                  )}
                  {msg.toolCalls && msg.toolCalls.length > 0 && (
                    <XDSChatToolCalls calls={msg.toolCalls ?? []} />
                  )}
                </XDSChatMessage>
              );
            })}
          </XDSChatMessageList>
        </div>

        {/* Frosted glass layer — sits behind the composer */}
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: 120,
            pointerEvents: 'none',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            maskImage: 'linear-gradient(to bottom, transparent, black 48px)',
            WebkitMaskImage:
              'linear-gradient(to bottom, transparent, black 48px)',
          }}
        />
        {/* Composer dock */}
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '0 16px 12px',
          }}>
          <div style={{maxWidth: 800, margin: '0 auto'}}>
            <XDSChatComposer
              onSubmit={handleSubmit}
              onStop={handleStop}
              isStreaming={isStreaming}
              attachments={
                files.length > 0 ? (
                  <XDSChatComposerAttachments>
                    {files.map(f => (
                      <XDSToken
                        key={f}
                        label={f}
                        onRemove={() =>
                          setFiles(prev => prev.filter(x => x !== f))
                        }
                      />
                    ))}
                  </XDSChatComposerAttachments>
                ) : undefined
              }
              headerActions={
                <>
                  <XDSButton
                    label="Mention"
                    variant="ghost"
                    size="sm"
                    icon={AtSignIcon}
                    isIconOnly
                    onClick={() => {
                      inputRef.current?.focus();
                      inputRef.current?.insertText('@');
                    }}
                  />
                  <XDSButton
                    label="Attach"
                    variant="ghost"
                    size="sm"
                    icon={PaperclipIcon}
                    isIconOnly
                    onClick={() =>
                      setFiles(prev => [...prev, `file-${prev.length + 1}.tsx`])
                    }
                  />
                </>
              }
              headerContext={
                <>
                  <div
                    ref={contextTooltip.ref}
                    aria-describedby={contextTooltip.describedBy}
                    style={{paddingInlineEnd: 8}}>
                    <XDSProgressBar
                      label="Context"
                      value={12}
                      variant="neutral"
                      isLabelHidden
                    />
                  </div>
                  {contextTooltip.renderTooltip('3k / 100k tokens used')}
                </>
              }
              input={
                <XDSChatComposerInput
                  ref={inputRef}
                  triggers={triggers}
                  placeholder="Ask about the codebase..."
                />
              }
              footerActions={
                <XDSButton label="Claude Opus" variant="ghost" size="md" />
              }
              sendActions={
                <XDSButton
                  label="Microphone"
                  variant="ghost"
                  size="md"
                  icon={MicIcon}
                  isIconOnly
                />
              }
            />
          </div>
        </div>
      </>
    );
  },
};
