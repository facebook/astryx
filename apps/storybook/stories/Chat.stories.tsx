import type {Meta, StoryObj} from '@storybook/react';
import {
  XDSChatMessageList,
  XDSChatMessage,
  XDSChatMessageBubble,
  XDSChatMessageMetadata,
  XDSChatSystemMessage,
} from '@xds/core/Chat';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSMarkdown} from '@xds/core/Markdown';
import {XDSToken} from '@xds/core/Token';
import {XDSHStack} from '@xds/core/Stack';
import {XDSCodeBlock} from '@xds/core/CodeBlock';
import {XDSButton} from '@xds/core/Button';
import {XDSIcon} from '@xds/core/Icon';
import {XDSTimestamp} from '@xds/core/Timestamp';
import {HandThumbUpIcon, HandThumbDownIcon} from '@heroicons/react/24/outline';
import {ClipboardDocumentIcon} from '@heroicons/react/24/outline';
import {useState, useEffect, useCallback} from 'react';

const meta: Meta<typeof XDSChatMessageList> = {
  title: 'Chat/XDSChatMessageList',
  component: XDSChatMessageList,
  tags: ['autodocs'],
};
export default meta;

export const Default: StoryObj = {
  name: 'Default',
  render: () => (
    <div style={{height: 500, display: 'flex', flexDirection: 'column'}}>
      <XDSChatMessageList>
        <XDSChatMessage sender="user">
          <XDSChatMessageBubble>How do I center a div?</XDSChatMessageBubble>
        </XDSChatMessage>
        <XDSChatMessage sender="assistant">
          <XDSMarkdown density="compact">{`There are several ways:

**Flexbox** (most common):
\`\`\`css
display: flex;
justify-content: center;
align-items: center;
\`\`\`

**Grid** (simplest):
\`\`\`css
display: grid;
place-items: center;
\`\`\`

Both work great.`}</XDSMarkdown>
        </XDSChatMessage>
        <XDSChatMessage sender="user">
          <XDSChatMessageBubble>
            What about absolute positioning?
          </XDSChatMessageBubble>
        </XDSChatMessage>
        <XDSChatMessage sender="assistant">
          <XDSMarkdown density="compact">{`You can, but prefer flexbox or grid — they handle responsive layouts much better.`}</XDSMarkdown>
        </XDSChatMessage>
      </XDSChatMessageList>
    </div>
  ),
};

export const Detailed: StoryObj = {
  name: 'Detailed',
  render: () => (
    <div style={{height: 500, display: 'flex', flexDirection: 'column'}}>
      <XDSChatMessageList>
        <XDSChatSystemMessage variant="divider">Today</XDSChatSystemMessage>
        <XDSChatMessage sender="user" name="Cindy">
          <XDSChatMessageBubble>
            Can you look at the chat component spec?
          </XDSChatMessageBubble>
        </XDSChatMessage>
        <XDSChatMessage
          sender="assistant"
          name="Navi"
          avatar={<XDSAvatar name="Navi" size="small" />}>
          <XDSMarkdown density="compact">{`I looked into the **chat component spec** and have some thoughts.

The compound pattern we discussed handles all the 3P patterns:

- **V0/Copilot**: artifact pane alongside chat
- **Jules**: async session review
- **Codex**: collapsed chain-of-thought

No new components needed.`}</XDSMarkdown>
        </XDSChatMessage>
        <XDSChatMessage sender="user" name="Cindy">
          <XDSChatMessageBubble>
            Nice, what about system messages?
          </XDSChatMessageBubble>
        </XDSChatMessage>
        <XDSChatSystemMessage>Cindy liked a message</XDSChatSystemMessage>
      </XDSChatMessageList>
    </div>
  ),
};

export const Maximal: StoryObj = {
  name: 'Maximal',
  render: () => (
    <div style={{height: 500, display: 'flex', flexDirection: 'column'}}>
      <XDSChatMessageList>
        <XDSChatSystemMessage variant="divider">
          March 15, 2026
        </XDSChatSystemMessage>
        <XDSChatMessage
          sender="assistant"
          name="Navi"
          avatar={<XDSAvatar name="Navi" size="small" />}>
          <XDSMarkdown density="compact">{`Good afternoon! I've been looking at the **NDS gap analysis** and have the priority list ready.`}</XDSMarkdown>
          <XDSChatMessageMetadata
            timestamp={
              <XDSTimestamp value="2026-03-15T14:30:00" format="time" />
            }
          />
        </XDSChatMessage>
        <XDSChatMessage
          sender="user"
          name="Cindy"
          avatar={<XDSAvatar name="Cindy" size="small" />}>
          <XDSChatMessageBubble>Great, what's at the top?</XDSChatMessageBubble>
          <XDSChatMessageMetadata
            timestamp={
              <XDSTimestamp value="2026-03-15T14:31:00" format="time" />
            }
            status="read"
          />
        </XDSChatMessage>
        <XDSChatMessage
          sender="assistant"
          name="Navi"
          avatar={<XDSAvatar name="Navi" size="small" />}>
          <XDSMarkdown density="compact">{`Chat components — **1,847 usages** across 42 apps.

1. \`ChatBubble\` — 1,847 usages
2. \`ChatTypingIndicator\` — 463 usages
3. \`TextShimmer\` — 706 usages`}</XDSMarkdown>
          <XDSChatMessageMetadata
            timestamp={
              <XDSTimestamp value="2026-03-15T14:31:30" format="time" />
            }
          />
        </XDSChatMessage>
        <XDSChatMessage
          sender="user"
          name="Cindy"
          avatar={<XDSAvatar name="Cindy" size="small" />}>
          <XDSChatMessageBubble>
            Let's start on that today.
          </XDSChatMessageBubble>
          <XDSChatMessageMetadata
            timestamp={
              <XDSTimestamp value="2026-03-15T14:32:00" format="time" />
            }
            status="read"
          />
        </XDSChatMessage>
        <XDSChatSystemMessage>Conversation ended</XDSChatSystemMessage>
      </XDSChatMessageList>
    </div>
  ),
};

export const MixedContent: StoryObj = {
  name: 'Mixed Content',
  render: () => (
    <div style={{height: 500, display: 'flex', flexDirection: 'column'}}>
      <XDSChatMessageList>
        <XDSChatMessage sender="user">
          <XDSChatMessageBubble>
            Show me the component files
          </XDSChatMessageBubble>
        </XDSChatMessage>
        <XDSChatMessage
          sender="assistant"
          name="Navi"
          avatar={<XDSAvatar name="Navi" size="small" />}>
          <XDSMarkdown density="compact">
            Here are the files you asked about:
          </XDSMarkdown>
          <XDSHStack gap={2} wrap="wrap">
            <XDSToken label="Button.tsx" />
            <XDSToken label="Card.tsx" />
            <XDSToken label="Dialog.tsx" />
          </XDSHStack>
          <XDSMarkdown density="compact">
            And here's the entry point:
          </XDSMarkdown>
          <XDSCodeBlock
            code={
              "export * from './Button';\nexport * from './Card';\nexport * from './Dialog';"
            }
            language="typescript"
          />
          <XDSMarkdown density="compact">
            Let me know which one to open.
          </XDSMarkdown>
        </XDSChatMessage>
      </XDSChatMessageList>
    </div>
  ),
};

export const DensityComparison: StoryObj = {
  name: 'Density Comparison',
  render: () => {
    const avatarSize = {
      compact: 'xsmall' as const,
      balanced: 'small' as const,
      spacious: 'small' as const,
    };
    const messages = (density: 'compact' | 'balanced' | 'spacious') => (
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          border: '1px solid var(--color-border-primary)',
          borderRadius: 8,
        }}>
        <div
          style={{
            padding: '8px 12px',
            borderBottom: '1px solid var(--color-border-primary)',
            fontSize: 12,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
          {density}
        </div>
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
          }}>
          <XDSChatMessageList density={density}>
            <XDSChatMessage sender="user">
              <XDSChatMessageBubble>
                How does the density system work?
              </XDSChatMessageBubble>
            </XDSChatMessage>
            <XDSChatMessage
              sender="assistant"
              avatar={<XDSAvatar name="Navi" size={avatarSize[density]} />}>
              <XDSMarkdown density="compact">{`Density controls **spacing** at every level:

- **Gap** between messages
- **Padding** inside bubbles
- **Gap** between child elements

This is the **${density}** density. ${density === 'compact' ? 'Great for sidebars and panels where space is limited.' : density === 'spacious' ? 'Ideal for long-form reading where breathing room helps comprehension.' : 'The default — works well for most full-page chat interfaces.'}`}</XDSMarkdown>
            </XDSChatMessage>
            <XDSChatMessage sender="user">
              <XDSChatMessageBubble>Makes sense, thanks!</XDSChatMessageBubble>
            </XDSChatMessage>
          </XDSChatMessageList>
        </div>
      </div>
    );

    return (
      <div style={{display: 'flex', gap: 16, height: 500}}>
        {messages('compact')}
        {messages('balanced')}
        {messages('spacious')}
      </div>
    );
  },
};

export const SystemMessages: StoryObj = {
  name: 'System Messages',
  render: () => (
    <div style={{height: 400, display: 'flex', flexDirection: 'column'}}>
      <XDSChatMessageList>
        <XDSChatSystemMessage variant="divider">
          March 15, 2026
        </XDSChatSystemMessage>
        <XDSChatMessage
          sender="assistant"
          avatar={<XDSAvatar name="Navi" size="small" />}>
          <XDSMarkdown density="compact">Good morning!</XDSMarkdown>
        </XDSChatMessage>
        <XDSChatSystemMessage>Conversation started</XDSChatSystemMessage>
        <XDSChatMessage sender="user">
          <XDSChatMessageBubble>Hey Navi</XDSChatMessageBubble>
        </XDSChatMessage>
        <XDSChatSystemMessage variant="divider">Today</XDSChatSystemMessage>
        <XDSChatSystemMessage>Cindy shared a file</XDSChatSystemMessage>
      </XDSChatMessageList>
    </div>
  ),
};

export const AutoScroll: StoryObj = {
  name: 'Auto Scroll',
  render: () => {
    const [messages, setMessages] = useState([
      {id: 1, sender: 'user' as const, text: 'Tell me a story'},
      {id: 2, sender: 'assistant' as const, text: 'Once upon a time...'},
    ]);

    const addMessage = useCallback(() => {
      setMessages(prev => {
        const isUser = prev[prev.length - 1]?.sender === 'assistant';
        const id = prev.length + 1;
        return [
          ...prev,
          {
            id,
            sender: isUser ? ('user' as const) : ('assistant' as const),
            text: isUser
              ? `Message #${id} from user`
              : `This is a response to message #${id - 1}. The auto-scroll keeps the view pinned to the bottom as new messages arrive.`,
          },
        ];
      });
    }, []);

    useEffect(() => {
      const interval = setInterval(addMessage, 2000);
      return () => clearInterval(interval);
    }, [addMessage]);

    return (
      <div style={{height: 400, display: 'flex', flexDirection: 'column'}}>
        <XDSChatMessageList>
          {messages.map(msg =>
            msg.sender === 'user' ? (
              <XDSChatMessage key={msg.id} sender="user">
                <XDSChatMessageBubble>{msg.text}</XDSChatMessageBubble>
              </XDSChatMessage>
            ) : (
              <XDSChatMessage key={msg.id} sender="assistant">
                <XDSMarkdown density="compact">{msg.text}</XDSMarkdown>
              </XDSChatMessage>
            ),
          )}
        </XDSChatMessageList>
      </div>
    );
  },
};

export const EmptyState: StoryObj = {
  name: 'Empty State',
  render: () => (
    <div style={{height: 400, display: 'flex', flexDirection: 'column'}}>
      <XDSChatMessageList
        emptyState={
          <div style={{textAlign: 'center', opacity: 0.5}}>
            <div style={{fontSize: 32, marginBottom: 8}}>💬</div>
            <div>No messages yet. Start a conversation!</div>
          </div>
        }>
        {[]}
      </XDSChatMessageList>
    </div>
  ),
};

export const MessageStatus: StoryObj = {
  name: 'Message Status',
  render: () => (
    <div style={{height: 400, display: 'flex', flexDirection: 'column'}}>
      <XDSChatMessageList>
        <XDSChatMessage sender="user">
          <XDSChatMessageBubble>Sending...</XDSChatMessageBubble>
          <XDSChatMessageMetadata status="sending" />
        </XDSChatMessage>
        <XDSChatMessage sender="user">
          <XDSChatMessageBubble>Sent</XDSChatMessageBubble>
          <XDSChatMessageMetadata status="sent" />
        </XDSChatMessage>
        <XDSChatMessage sender="user">
          <XDSChatMessageBubble>Delivered</XDSChatMessageBubble>
          <XDSChatMessageMetadata status="delivered" />
        </XDSChatMessage>
        <XDSChatMessage sender="user">
          <XDSChatMessageBubble>Read</XDSChatMessageBubble>
          <XDSChatMessageMetadata status="read" />
        </XDSChatMessage>
        <XDSChatMessage sender="user">
          <XDSChatMessageBubble>Failed to send</XDSChatMessageBubble>
          <XDSChatMessageMetadata status="error" />
        </XDSChatMessage>
      </XDSChatMessageList>
    </div>
  ),
};

export const MultiBubble: StoryObj = {
  name: 'Multi-Bubble Grouping',
  render: () => (
    <div style={{height: 500, display: 'flex', flexDirection: 'column'}}>
      <XDSChatMessageList>
        <XDSChatMessage sender="user">
          <XDSChatMessageBubble group="first">
            Hey, can you review my PR?
          </XDSChatMessageBubble>
          <XDSChatMessageBubble group="middle">
            It's the one for the chat components
          </XDSChatMessageBubble>
          <XDSChatMessageBubble group="last">
            Link: github.com/xds/pull/1180
          </XDSChatMessageBubble>
          <XDSChatMessageMetadata
            timestamp={
              <XDSTimestamp value="2026-03-15T14:31:00" format="time" />
            }
            status="delivered"
          />
        </XDSChatMessage>
        <XDSChatMessage
          sender="assistant"
          avatar={<XDSAvatar name="Navi" size="small" />}>
          <XDSChatMessageBubble group="first">
            Sure, looking at it now!
          </XDSChatMessageBubble>
          <XDSChatMessageBubble group="middle">
            The compound pattern looks solid. A few minor comments on the
            density styles.
          </XDSChatMessageBubble>
          <XDSChatMessageBubble group="last">
            I'll leave them as review comments.
          </XDSChatMessageBubble>
          <XDSChatMessageMetadata
            timestamp={
              <XDSTimestamp value="2026-03-15T14:33:00" format="time" />
            }
          />
        </XDSChatMessage>
        <XDSChatMessage sender="user">
          <XDSChatMessageBubble>
            Thanks, will address those
          </XDSChatMessageBubble>
          <XDSChatMessageMetadata
            timestamp={
              <XDSTimestamp value="2026-03-15T14:34:00" format="time" />
            }
            status="sending"
          />
        </XDSChatMessage>
      </XDSChatMessageList>
    </div>
  ),
};

export const AssistantNoBubble: StoryObj = {
  name: 'Assistant Without Bubble',
  render: () => (
    <div style={{height: 500, display: 'flex', flexDirection: 'column'}}>
      <XDSChatMessageList>
        <XDSChatMessage sender="user" name="Cindy">
          <XDSChatMessageBubble>
            Explain the component architecture
          </XDSChatMessageBubble>
          <XDSChatMessageMetadata status="read" />
        </XDSChatMessage>
        <XDSChatMessage
          sender="assistant"
          name="Navi"
          avatar={<XDSAvatar name="Navi" size="small" />}>
          <XDSMarkdown density="compact">{`The architecture uses a **compound component** pattern:

- **MessageList** — scrollable container with auto-scroll
- **Message** — layout wrapper with sender context
- **MessageBubble** — styled content container

Each level provides context to its children via React context.`}</XDSMarkdown>
          <XDSChatMessageMetadata
            timestamp={
              <XDSTimestamp value="2026-03-15T14:35:00" format="time" />
            }
          />
        </XDSChatMessage>
        <XDSChatMessage sender="user" name="Cindy">
          <XDSChatMessageBubble>
            Makes sense. What about the density system?
          </XDSChatMessageBubble>
          <XDSChatMessageMetadata
            timestamp={
              <XDSTimestamp value="2026-03-15T14:36:00" format="time" />
            }
            status="delivered"
          />
        </XDSChatMessage>
        <XDSChatMessage
          sender="assistant"
          name="Navi"
          avatar={<XDSAvatar name="Navi" size="small" />}>
          <XDSMarkdown density="compact">{`Density flows from **MessageList → Message → Bubble** via context:

1. \`compact\` — tight spacing, sidebar use
2. \`balanced\` — default, full-page chat
3. \`spacious\` — extra room, long-form reading`}</XDSMarkdown>
          <XDSChatMessageMetadata
            timestamp={
              <XDSTimestamp value="2026-03-15T14:36:30" format="time" />
            }
          />
        </XDSChatMessage>
      </XDSChatMessageList>
    </div>
  ),
};

export const MessageFooter: StoryObj = {
  name: 'Message Footer',
  render: () => (
    <div style={{height: 500, display: 'flex', flexDirection: 'column'}}>
      <XDSChatMessageList>
        <XDSChatMessage sender="user" name="Cindy">
          <XDSChatMessageBubble>
            What's the best way to handle state?
          </XDSChatMessageBubble>
          <XDSChatMessageMetadata status="read" />
        </XDSChatMessage>
        <XDSChatMessage
          sender="assistant"
          name="Navi"
          avatar={<XDSAvatar name="Navi" size="small" />}>
          <XDSMarkdown density="compact">{`For most cases, **React's built-in state** is sufficient:

- \`useState\` for local component state
- \`useReducer\` for complex state logic
- \`useContext\` for shared state across a subtree

For server state, use a library like **TanStack Query** or **SWR**.`}</XDSMarkdown>
          <XDSChatMessageMetadata
            timestamp={
              <XDSTimestamp value="2026-03-15T14:35:00" format="time" />
            }
            footer={
              <>
                <span>Claude Opus 4.6</span>
                <span>·</span>
                <XDSButton
                  label="Thumbs up"
                  icon={<HandThumbUpIcon style={{width: 14, height: 14}} />}
                  variant="ghost"
                  size="sm"
                  isIconOnly
                />
                <XDSButton
                  label="Thumbs down"
                  icon={<HandThumbDownIcon style={{width: 14, height: 14}} />}
                  variant="ghost"
                  size="sm"
                  isIconOnly
                />
              </>
            }
          />
        </XDSChatMessage>
        <XDSChatMessage
          sender="assistant"
          name="Navi"
          avatar={<XDSAvatar name="Navi" size="small" />}>
          <XDSMarkdown density="compact">
            Avoid global state managers unless you have a genuine need for
            cross-cutting state. Most apps are over-engineered in this area.
          </XDSMarkdown>
          <XDSChatMessageMetadata
            timestamp={
              <XDSTimestamp value="2026-03-15T14:36:00" format="time" />
            }
            footer={
              <>
                <span>Claude Opus 4.6</span>
                <span>·</span>
                <XDSButton
                  label="Thumbs up"
                  icon={<HandThumbUpIcon style={{width: 14, height: 14}} />}
                  variant="ghost"
                  size="sm"
                  isIconOnly
                />
                <XDSButton
                  label="Thumbs down"
                  icon={<HandThumbDownIcon style={{width: 14, height: 14}} />}
                  variant="ghost"
                  size="sm"
                  isIconOnly
                />
                <XDSButton
                  label="Copy"
                  icon={
                    <ClipboardDocumentIcon style={{width: 14, height: 14}} />
                  }
                  variant="ghost"
                  size="sm"
                  isIconOnly
                />
              </>
            }
          />
        </XDSChatMessage>
      </XDSChatMessageList>
    </div>
  ),
};

export const ScrollToBottom: StoryObj = {
  name: 'Scroll to Bottom',
  render: () => {
    const [messages, setMessages] = useState(
      Array.from({length: 30}, (_, i) => ({
        id: i + 1,
        sender: i % 2 === 0 ? ('user' as const) : ('assistant' as const),
        text:
          i % 2 === 0
            ? `User message #${i + 1}`
            : `This is assistant response #${i + 1}. It has enough content to require scrolling through the message list.`,
      })),
    );

    const addNewMessage = useCallback(() => {
      setMessages(prev => [
        ...prev,
        {
          id: prev.length + 1,
          sender: 'assistant' as const,
          text: `New message arrived at ${new Date().toLocaleTimeString()}. Scroll up to see the button expand with a "New messages" label.`,
        },
      ]);
    }, []);

    return (
      <div style={{height: 400, display: 'flex', flexDirection: 'column'}}>
        <div
          style={{
            padding: '8px 16px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            gap: 8,
            alignItems: 'center',
          }}>
          <XDSButton
            label="Add message"
            variant="secondary"
            size="sm"
            onClick={addNewMessage}
          />
          <span style={{fontSize: 12, color: 'var(--color-text-secondary)'}}>
            Scroll up, then click "Add message" to see the button expand
          </span>
        </div>
        <XDSChatMessageList>
          {messages.map(msg => (
            <XDSChatMessage key={msg.id} sender={msg.sender}>
              <XDSChatMessageBubble>{msg.text}</XDSChatMessageBubble>
            </XDSChatMessage>
          ))}
        </XDSChatMessageList>
      </div>
    );
  },
};
