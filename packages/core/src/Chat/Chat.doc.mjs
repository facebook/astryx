/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Chat',
  description:
    'Chat components for AI chat interfaces. Layout (MessageList, Message, Bubble, SystemMessage) + Composer (Composer, ComposerInput with trigger menus, ComposerAttachments).',
  keywords: ['chat', 'message', 'bubble', 'conversation', 'ai', 'assistant', 'thread', 'system-message', 'composer', 'mention', 'trigger', 'typeahead', 'token'],
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
    'Composer layout shell with named semantic slots',
    'ContentEditable input with @ mention and / command trigger menus',
    'XDSSearchSource integration — reuses Typeahead search sources',
    'Concentric radius — inner elements follow outer shell curvature',
    'Themeable via --composer-radius and --composer-padding CSS vars',
  ],
  theming: {
    targets: [
      {className: 'xds-chat-composer', visualProps: ['density']},
      {className: 'xds-chat-composer-input'},
    ],
    vars: [
      {name: '--composer-radius', description: 'Border radius of the composer body. Inner elements derive their radius concentrically.', default: 'var(--radius-page)'},
      {name: '--composer-padding', description: 'Padding of the composer body. Used in the concentric radius calculation.', default: 'var(--spacing-3)'},
      {name: '--button-radius', description: 'Concentric button radius inside the composer.', default: 'max(var(--radius-element), calc(var(--composer-radius) - var(--composer-padding)))', derived: true, formula: 'max(var(--radius-element), calc(var(--composer-radius) - var(--composer-padding)))'},
    ],
  },
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
    {
      name: 'XDSChatComposer',
      description: 'Layout shell for a chat composer. Arranges named slots (attachments, toolbar, input, footer, send) with page-radius container, hover/focus shadows, and concentric inner radius for child elements.',
      props: [
        {name: 'onSubmit', type: '(value: string) => void', description: 'Called when the user submits a message.', required: true},
        {name: 'onStop', type: '() => void', description: 'Called when the user requests to stop generation.'},
        {name: 'isStreaming', type: 'boolean', description: 'Whether the assistant is currently streaming.', default: 'false'},
        {name: 'value', type: 'string', description: 'Controlled input value.'},
        {name: 'onChange', type: '(value: string) => void', description: 'Change handler for controlled mode.'},
        {name: 'placeholder', type: 'string', description: 'Placeholder text.', default: "'Type a message\u2026'"},
        {name: 'isDisabled', type: 'boolean', description: 'Disables the composer.', default: 'false'},
        {name: 'density', type: "'compact' | 'balanced' | 'spacious'", description: 'Visual density.', default: "'balanced'"},
        {name: 'attachments', type: 'ReactNode', description: 'Slot: attachment chips above the input. Use XDSChatComposerAttachments.'},
        {name: 'contextToolbar', type: 'ReactNode', description: 'Slot: toolbar between attachments and input. Use XDSToolbar.'},
        {name: 'input', type: 'ReactNode', description: 'Slot: custom input element. Replaces the default textarea. Use XDSChatComposerInput for trigger menus.'},
        {name: 'footerActions', type: 'ReactNode', description: 'Slot: left-aligned footer actions (model selector, etc).'},
        {name: 'sendActions', type: 'ReactNode', description: 'Slot: actions to the left of the send button.'},
        {name: 'sendButton', type: 'ReactNode', description: 'Slot: custom send button. Replaces the default send/stop button.'},
        {name: 'status', type: "{ type: 'error' | 'warning'; message?: string }", description: 'Status message below (or above) the composer.'},
        {name: 'statusPosition', type: "'top' | 'bottom'", description: 'Where to render the status.', default: "'bottom'"},
      ],

      examples: [
        {label: 'Simplest', code: '<XDSChatComposer onSubmit={handleSubmit} />'},
        {label: 'With trigger menus', code: '<XDSChatComposer onSubmit={handleSubmit} input={<XDSChatComposerInput triggers={triggers} />} />'},
        {label: 'Theme override', code: "defineTheme({ components: { 'chat-composer': { base: { '--composer-radius': '20px' } } } })"},
      ],
    },
    {
      name: 'XDSChatComposerInput',
      description: 'ContentEditable-based rich input with trigger menus (@ mentions, / commands), inline tokens, serialization, message history, and paste/drop file handling. Uses XDSSearchSource for search.',
      props: [
        {name: 'ref', type: 'React.Ref<HTMLDivElement>', description: 'Ref to the root element.'},
        {name: 'value', type: 'string', description: 'Controlled value.'},
        {name: 'onChange', type: '(value: string) => void', description: 'Change handler.'},
        {name: 'placeholder', type: 'string', description: 'Placeholder text.', default: "'Type a message\u2026'"},
        {name: 'maxRows', type: 'number', description: 'Max rows before scrolling.', default: '8'},
        {name: 'triggers', type: 'XDSChatComposerTrigger[]', description: 'Trigger definitions for menus. Each trigger has a character, searchSource, and onSelect.'},
        {name: 'debounceMs', type: 'number', description: 'Debounce for async search sources.', default: '150'},
        {name: 'hasHistory', type: 'boolean', description: 'Enable ArrowUp/Down message recall.', default: 'true'},
        {name: 'label', type: 'string', description: 'Accessible label.', default: "'Message input'"},
        {name: 'isDisabled', type: 'boolean', description: 'Disabled state.', default: 'false'},
        {name: 'onPaste', type: '(event, text) => void', description: 'Paste handler.'},
        {name: 'onFiles', type: '(files: File[]) => void', description: 'File drop/paste handler.'},
        {name: 'onSubmit', type: '(value: string) => void', description: 'Submit handler (Enter without Shift).'},
      ],
      examples: [
        {label: 'With mentions', code: `<XDSChatComposerInput triggers={[{ character: '@', searchSource: createStaticSource(users), onSelect: (item) => ({ value: '@' + item.id, render: () => <span>@{item.label}</span> }) }]} />`},
      ],
    },
    {
      name: 'XDSChatComposerAttachments',
      description: 'Flex-wrap container for attachment items (tokens, thumbnails, previews) inside the composer.',
      props: [
        {name: 'children', type: 'ReactNode', description: 'Attachment items to render.', required: true},
        {name: 'count', type: 'number', description: 'Total attachment count. When provided and exceeds visible children, shows a collapse/expand toggle.'},
      ],
      examples: [
        {label: 'With tokens', code: `<XDSChatComposerAttachments>\n  <XDSToken label="report.pdf" onDismiss={() => {}} />\n</XDSChatComposerAttachments>`},
      ],
    },
  ],
};
