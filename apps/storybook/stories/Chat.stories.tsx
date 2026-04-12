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
import {XDSEmptyState} from '@xds/core/EmptyState';
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
    <div style={{height: 600, display: 'flex', flexDirection: 'column'}}>
      <XDSChatMessageList>
        <XDSChatMessage sender="user">
          <XDSChatMessageBubble>
            How should I handle state management in a React app?
          </XDSChatMessageBubble>
          <XDSChatMessageMetadata
            timestamp={<XDSTimestamp value="2026-03-15T14:30:00" format="time" />}
            status="read"
          />
        </XDSChatMessage>
        <XDSChatMessage sender="assistant">
          <XDSMarkdown density="compact">{`For most cases, **React's built-in state** is sufficient:

- \`useState\` for local component state
- \`useReducer\` for complex state logic
- \`useContext\` for shared state across a subtree

For **server state**, use a library like **TanStack Query** or **SWR** — they handle caching, revalidation, and loading states out of the box.

Avoid global state managers unless you have a genuine need for cross-cutting state. Most apps are over-engineered in this area.`}</XDSMarkdown>
          <XDSChatMessageMetadata
            timestamp={<XDSTimestamp value="2026-03-15T14:30:30" format="time" />}
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
                  icon={<ClipboardDocumentIcon style={{width: 14, height: 14}} />}
                  variant="ghost"
                  size="sm"
                  isIconOnly
                />
              </>
            }
          />
        </XDSChatMessage>
        <XDSChatMessage sender="user">
          <XDSChatMessageBubble>
            Can you show me a useReducer example?
          </XDSChatMessageBubble>
          <XDSChatMessageMetadata
            timestamp={<XDSTimestamp value="2026-03-15T14:31:00" format="time" />}
            status="read"
          />
        </XDSChatMessage>
        <XDSChatMessage sender="assistant">
          <XDSMarkdown density="compact">Here's a common pattern for form state:</XDSMarkdown>
          <XDSCodeBlock
            code={`const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
};

const [state, dispatch] = useReducer(reducer, initialState);`}
            language="tsx"
          />
          <XDSMarkdown density="compact">{`This keeps all your form logic in one place. The reducer is pure and easy to test — just pass in state and action, assert on the output.`}</XDSMarkdown>
          <XDSChatMessageMetadata
            timestamp={<XDSTimestamp value="2026-03-15T14:31:30" format="time" />}
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
                  icon={<ClipboardDocumentIcon style={{width: 14, height: 14}} />}
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

export const MixedContent: StoryObj = {
  name: 'Mixed Content',
  render: () => (
    <div style={{height: 600, display: 'flex', flexDirection: 'column'}}>
      <XDSChatMessageList>
        <XDSChatMessage sender="user">
          <XDSChatMessageBubble>
            Show me the component files and explain the architecture
          </XDSChatMessageBubble>
        </XDSChatMessage>

        <XDSChatMessage
          sender="assistant"
          avatar={<XDSAvatar name="Navi" size="small" />}>
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

        <XDSChatMessage
          sender="assistant"
          avatar={<XDSAvatar name="Navi" size="small" />}>
          <XDSChatMessageBubble variant="ghost">
            <XDSCodeBlock
              code={`import * as stylex from '@stylexjs/stylex';

export function XDSButton({ label, variant = 'primary' }) {
  return (
    <button {...stylex.props(styles.base, styles[variant])}>
      {label}
    </button>
  );
}`}
              language="tsx"
            />
            <XDSMarkdown density="compact">{`The Button uses StyleX for styles and reads variant from props.`}</XDSMarkdown>
          </XDSChatMessageBubble>
        </XDSChatMessage>
      </XDSChatMessageList>
    </div>
  ),
};

export const ChatConversation: StoryObj = {
  name: 'Chat Conversation',
  render: () => (
    <div style={{height: 500, display: 'flex', flexDirection: 'column'}}>
      <XDSChatMessageList>
        <XDSChatSystemMessage variant="divider">Today</XDSChatSystemMessage>
        <XDSChatMessage
          sender="assistant"
          name="Navi"
          avatar={<XDSAvatar name="Navi" size="small" />}>
          <XDSChatMessageBubble>
            Hey! I looked at the PR and left a few comments on the density
            styles.
          </XDSChatMessageBubble>
          <XDSChatMessageMetadata
            timestamp={<XDSTimestamp value="2026-03-15T14:30:00" format="time" />}
          />
        </XDSChatMessage>

        <XDSChatMessage
          sender="user"
          name="Cindy"
          avatar={<XDSAvatar name="Cindy" size="small" />}>
          <XDSChatMessageBubble group="first">
            Thanks! I'll take a look.
          </XDSChatMessageBubble>
          <XDSChatMessageBubble group="last">
            Should be quick to fix.
          </XDSChatMessageBubble>
          <XDSChatMessageMetadata
            timestamp={<XDSTimestamp value="2026-03-15T14:31:00" format="time" />}
            status="read"
          />
        </XDSChatMessage>

        <XDSChatMessage
          sender="assistant"
          name="Navi"
          avatar={<XDSAvatar name="Navi" size="small" />}>
          <XDSChatMessageBubble>
            Sounds good. The main thing is the compact radius — it should use
            the container token, not the page token.
          </XDSChatMessageBubble>
          <XDSChatMessageMetadata
            timestamp={<XDSTimestamp value="2026-03-15T14:32:00" format="time" />}
          />
        </XDSChatMessage>

        <XDSChatMessage
          sender="user"
          name="Cindy"
          avatar={<XDSAvatar name="Cindy" size="small" />}>
          <XDSChatMessageBubble>
            Good catch, fixed and pushed.
          </XDSChatMessageBubble>
          <XDSChatMessageMetadata
            timestamp={<XDSTimestamp value="2026-03-15T14:33:00" format="time" />}
            status="delivered"
          />
        </XDSChatMessage>

        <XDSChatSystemMessage>Cindy liked a message</XDSChatSystemMessage>
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
          <XDSEmptyState
            title="No messages yet"
            description="Start a conversation!"
          />
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
