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
import {XDSTimestamp} from '@xds/core/Timestamp';
import {HandThumbUpIcon, HandThumbDownIcon} from '@heroicons/react/24/outline';
import {ClipboardDocumentIcon} from '@heroicons/react/24/outline';

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
          <XDSChatMessageBubble
            metadata={
              <XDSChatMessageMetadata
                timestamp={<XDSTimestamp value="2026-03-15T14:30:00" format="time" />}
                status="read"
              />
            }>
            How should I handle state management in a React app?
          </XDSChatMessageBubble>
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
          <XDSChatMessageBubble
            metadata={
              <XDSChatMessageMetadata
                timestamp={<XDSTimestamp value="2026-03-15T14:31:00" format="time" />}
                status="read"
              />
            }>
            Can you show me a useReducer example?
          </XDSChatMessageBubble>
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
  render: () => {
    const nameStyle = {
      fontSize: 12,
      fontWeight: 600,
      color: '#666',
      lineHeight: '16px',
    };
    return (
      <div style={{height: 500, display: 'flex', flexDirection: 'column'}}>
        <XDSChatMessageList>
          <XDSChatSystemMessage variant="divider">Today</XDSChatSystemMessage>
          <XDSChatMessage
            sender="assistant"
            avatar={<XDSAvatar name="Navi" size="small" />}>
            <XDSChatMessageBubble
              name={<span style={nameStyle}>Navi</span>}
              metadata={
                <XDSChatMessageMetadata
                  timestamp={<XDSTimestamp value="2026-03-15T14:30:00" format="time" />}
                />
              }>
              Hey! I looked at the PR and left a few comments on the density
              styles.
            </XDSChatMessageBubble>
          </XDSChatMessage>

          <XDSChatMessage
            sender="user"
            avatar={<XDSAvatar name="Cindy" size="small" />}>
            <XDSChatMessageBubble
              group="first"
              name={<span style={nameStyle}>Cindy</span>}>
              Thanks! I'll take a look.
            </XDSChatMessageBubble>
            <XDSChatMessageBubble
              group="last"
              metadata={
                <XDSChatMessageMetadata
                  timestamp={<XDSTimestamp value="2026-03-15T14:31:00" format="time" />}
                  status="read"
                />
              }>
              Should be quick to fix.
            </XDSChatMessageBubble>
          </XDSChatMessage>

          <XDSChatMessage
            sender="assistant"
            avatar={<XDSAvatar name="Navi" size="small" />}>
            <XDSChatMessageBubble
              name={<span style={nameStyle}>Navi</span>}
              metadata={
                <XDSChatMessageMetadata
                  timestamp={<XDSTimestamp value="2026-03-15T14:32:00" format="time" />}
                />
              }>
              Sounds good. The main thing is the compact radius — it should use
              the container token, not the page token.
            </XDSChatMessageBubble>
          </XDSChatMessage>

          <XDSChatMessage
            sender="user"
            avatar={<XDSAvatar name="Cindy" size="small" />}>
            <XDSChatMessageBubble
              name={<span style={nameStyle}>Cindy</span>}
              metadata={
                <XDSChatMessageMetadata
                  timestamp={<XDSTimestamp value="2026-03-15T14:33:00" format="time" />}
                  status="delivered"
                />
              }>
              Good catch, fixed and pushed.
            </XDSChatMessageBubble>
          </XDSChatMessage>

          <XDSChatSystemMessage>Cindy liked a message</XDSChatSystemMessage>
        </XDSChatMessageList>
      </div>
    );
  },
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
export const MessageStatus: StoryObj = {
  name: 'Message Status',
  render: () => (
    <div style={{height: 400, display: 'flex', flexDirection: 'column'}}>
      <XDSChatMessageList>
        <XDSChatMessage sender="user">
          <XDSChatMessageBubble
            metadata={<XDSChatMessageMetadata status="sending" />}>
            Sending...
          </XDSChatMessageBubble>
        </XDSChatMessage>
        <XDSChatMessage sender="user">
          <XDSChatMessageBubble
            metadata={<XDSChatMessageMetadata status="sent" />}>
            Sent
          </XDSChatMessageBubble>
        </XDSChatMessage>
        <XDSChatMessage sender="user">
          <XDSChatMessageBubble
            metadata={<XDSChatMessageMetadata status="delivered" />}>
            Delivered
          </XDSChatMessageBubble>
        </XDSChatMessage>
        <XDSChatMessage sender="user">
          <XDSChatMessageBubble
            metadata={<XDSChatMessageMetadata status="read" />}>
            Read
          </XDSChatMessageBubble>
        </XDSChatMessage>
        <XDSChatMessage sender="user">
          <XDSChatMessageBubble
            metadata={<XDSChatMessageMetadata status="error" />}>
            Failed to send
          </XDSChatMessageBubble>
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
          <XDSChatMessageBubble
            group="last"
            metadata={
              <XDSChatMessageMetadata
                timestamp={
                  <XDSTimestamp value="2026-03-15T14:31:00" format="time" />
                }
                status="delivered"
              />
            }>
            Link: github.com/xds/pull/1180
          </XDSChatMessageBubble>
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
          <XDSChatMessageBubble
            group="last"
            metadata={
              <XDSChatMessageMetadata
                timestamp={
                  <XDSTimestamp value="2026-03-15T14:33:00" format="time" />
                }
              />
            }>
            I'll leave them as review comments.
          </XDSChatMessageBubble>
        </XDSChatMessage>
        <XDSChatMessage sender="user">
          <XDSChatMessageBubble
            metadata={
              <XDSChatMessageMetadata
                timestamp={
                  <XDSTimestamp value="2026-03-15T14:34:00" format="time" />
                }
                status="sending"
              />
            }>
            Thanks, will address those
          </XDSChatMessageBubble>
        </XDSChatMessage>
      </XDSChatMessageList>
    </div>
  ),
};
