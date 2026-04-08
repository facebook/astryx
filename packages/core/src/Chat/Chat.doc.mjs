/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Chat',
  description:
    'Chat layout components for AI chat interfaces. Composition model: XDSChatMessageList wraps XDSChatMessage and XDSChatSystemMessage. Messages contain optional XDSChatMessageBubble for styled content.',
  keywords: ['chat', 'message', 'bubble', 'conversation', 'ai', 'assistant', 'thread', 'system-message'],
  features: [
    'Composition model — MessageList > Message > Bubble',
    'Sender-aware styling (user, assistant, system) via context',
    'Auto-scroll with "New messages" indicator',
    'Infinite scroll via onScrollToTopAction with useTransition',
    'Density variants: compact, balanced, spacious (flows via context)',
    'System messages with optional divider variant for date separators',
    'Free-form children — not all content needs a bubble',
    'Timestamp display: hover or header',
    'Message status indicators (sending, sent, delivered, read, error)',
    'role="log" with aria-live="polite" for accessibility',
  ],
  examples: [
    {
      label: 'Basic conversation',
      code: `<XDSChatMessageList>
  <XDSChatMessage sender="assistant" name="Navi" avatar={<XDSAvatar name="Navi" size="sm" />}>
    <XDSChatMessageBubble>Hello! How can I help?</XDSChatMessageBubble>
  </XDSChatMessage>
  <XDSChatMessage sender="user" name="Cindy">
    <XDSChatMessageBubble>What's the status?</XDSChatMessageBubble>
  </XDSChatMessage>
</XDSChatMessageList>`,
    },
    {
      label: 'System message with divider',
      code: `<XDSChatSystemMessage variant="divider">Today</XDSChatSystemMessage>`,
    },
  ],
  components: [
    {
      name: 'XDSChatMessageList',
      description: 'Scrollable message container with auto-scroll and infinite scroll support.',
      props: [
        {name: 'children', type: 'ReactNode', description: 'Message elements — typically XDSChatMessage or XDSChatSystemMessage.', required: true},
        {name: 'hasAutoScroll', type: 'boolean', description: 'Enables auto-scroll to bottom on new content when near the bottom.', default: 'true'},
        {name: 'scrollThreshold', type: 'number', description: 'Distance from bottom (px) within which new content triggers auto-scroll.', default: '50'},
        {name: 'emptyState', type: 'ReactNode', description: 'Content shown when the list has no messages.'},
        {name: 'onScrollToTopAction', type: '() => Promise<void>', description: 'Async action fired when user scrolls to top. Use for loading older messages.'},
        {name: 'density', type: "'compact' | 'balanced' | 'spacious'", description: 'Visual density — flows to child messages via context.', default: "'balanced'"},
      ],
      examples: [
        {label: 'With infinite scroll', code: `<XDSChatMessageList onScrollToTopAction={loadOlder}>{messages.map(renderMessage)}</XDSChatMessageList>`},
      ],
    },
    {
      name: 'XDSChatMessage',
      description: 'Sender context wrapper — handles avatar, name, and alignment based on sender role.',
      props: [
        {name: 'sender', type: "'user' | 'assistant' | 'system'", description: 'Who sent this message — controls alignment and layout.', required: true},
        {name: 'children', type: 'ReactNode', description: 'Free-form content: bubbles, asset lists, tool calls, images.', required: true},
        {name: 'avatar', type: 'ReactNode', description: 'Avatar element rendered beside the message. Typically XDSAvatar.'},
        {name: 'name', type: 'string', description: 'Sender name displayed above the content.'},
        {name: 'density', type: "'compact' | 'balanced' | 'spacious'", description: 'Visual density. Inherited from list context if not set.'},
      ],
      examples: [
        {label: 'Assistant message', code: `<XDSChatMessage sender="assistant" name="Navi" avatar={<XDSAvatar name="Navi" size="sm" />}>\n  <XDSChatMessageBubble>Hello!</XDSChatMessageBubble>\n</XDSChatMessage>`},
      ],
    },
    {
      name: 'XDSChatMessageBubble',
      description: 'Styled bubble container — reads sender from parent context for auto-styling. Opt-in per content.',
      props: [
        {name: 'children', type: 'ReactNode', description: 'Bubble content — text, XDSMarkdown, or any ReactNode.', required: true},
        {name: 'timestamp', type: 'Date | string', description: 'Timestamp for the bubble. Date is auto-formatted.'},
        {name: 'timestampDisplay', type: "'header' | 'hover'", description: 'How the timestamp is shown.', default: "'hover'"},
        {name: 'footer', type: 'ReactNode', description: 'Footer below the bubble for reactions, actions, read receipts.'},
        {name: 'status', type: "'sending' | 'sent' | 'delivered' | 'read' | 'error'", description: 'Message status indicator. Only rendered for user messages.'},
      ],
      examples: [
        {label: 'With timestamp', code: `<XDSChatMessageBubble timestamp="2:30 PM" timestampDisplay="header">Hello!</XDSChatMessageBubble>`},
      ],
    },
    {
      name: 'XDSChatSystemMessage',
      description: 'Centered system/notice message for date separators, status updates, and non-sender content.',
      props: [
        {name: 'children', type: 'ReactNode', description: 'System message content.', required: true},
        {name: 'variant', type: "'default' | 'divider'", description: 'Visual variant. Divider adds horizontal lines on each side.', default: "'default'"},
        {name: 'icon', type: 'ReactNode', description: 'Icon rendered before the text.'},
        {name: 'timestamp', type: 'Date | string', description: 'Timestamp displayed after the text.'},
      ],
      examples: [
        {label: 'Date divider', code: `<XDSChatSystemMessage variant="divider">Today</XDSChatSystemMessage>`},
        {label: 'Status notice', code: `<XDSChatSystemMessage>Cindy shared a file</XDSChatSystemMessage>`},
      ],
    },
  ],
};
