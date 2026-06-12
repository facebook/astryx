// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Chat',
  displayName: 'Chat',
  group: 'Chat',
  category: 'Chat',
  // XDSChatPastedTextToken is an internal helper (not exported from index.ts).
  // Hide it from the component listing so it doesn't surface as an undocumented entry.
  hiddenComponents: ['ChatPastedTextToken'],
  keywords: ['chat', 'message', 'bubble', 'conversation', 'ai', 'assistant', 'thread', 'system-message', 'composer', 'mention', 'trigger', 'typeahead', 'token', 'imperative', 'tokenized-text'],
  theming: {
    targets: [
      {className: 'xds-chat-layout', visualProps: ['density']},
      {className: 'xds-chat-composer', visualProps: ['density']},
      {className: 'xds-chat-composer-input'},
      {className: 'xds-chat-composer-drawer', visualProps: ['collapsed']},
      {className: 'xds-chat-message', visualProps: ['sender']},
      {
        className: 'xds-chat-message-bubble',
        visualProps: ['sender', 'variant', 'density'],
      },
      {className: 'xds-chat-message-list', visualProps: ['density']},
      {className: 'xds-chat-system-message', visualProps: ['variant']},
      {className: 'xds-chat-message-metadata'},
      {className: 'xds-chat-send-button'},
      {className: 'xds-chat-tokenized-text'},
      {className: 'xds-chat-tool-calls'},
      {className: 'xds-trigger-menu'},
    ],
    vars: [
      {name: '--_chat-composer-radius', description: 'Border radius of the composer body. Inner elements derive their radius concentrically.', default: 'var(--radius-chat)', private: true},
      {name: '--_chat-composer-padding', description: 'Padding of the composer body. Used in the concentric radius calculation.', default: 'var(--spacing-3)', private: true},
      {name: '--_button-radius', description: 'Concentric button radius inside the composer.', default: 'max(var(--radius-element), calc(var(--_chat-composer-radius) - var(--_chat-composer-padding)))', private: true, derived: true, formula: 'max(var(--radius-element), calc(var(--_chat-composer-radius) - var(--_chat-composer-padding)))'},
    ],
    derived: [
      {property: 'borderRadius', vars: ['--_chat-composer-radius']},
      {property: 'padding', vars: ['--_chat-composer-padding']},
    ],
  },
  components: [
    {name: 'XDSChatMessageList'},
    {name: 'XDSChatMessage'},
    {name: 'XDSChatMessageBubble'},
    {name: 'XDSChatMessageMetadata'},
    {name: 'XDSChatSystemMessage'},
    {name: 'XDSChatComposer'},
    {name: 'XDSChatComposerInput'},
    {name: 'XDSChatComposerDrawer'},
    {name: 'XDSChatSendButton'},
    {name: 'XDSChatToolCalls'},
    {name: 'XDSChatTokenizedText'},
    {name: 'XDSChatComposerTokenElement'},
    {name: 'XDSChatLayout'},
    {name: 'XDSChatLayoutScrollButton'},
  ],
  usage: {
    description: 'XDSChatMessageList is the scrollable container for chat messages. It renders children in a flex column with role="log" for accessibility, provides density context to child messages, and supports infinite scroll for loading older messages. Use it inside XDSChatLayout for full-page chat with auto-scroll and composer docking, or standalone for embedded message panels.',
    bestPractices: [
      { guidance: true, description: 'Compose messages using MessageList > Message > Bubble for consistent sender-aware styling and density.' },
      { guidance: true, description: 'Set the density prop to control spacing globally: compact for sidebars, balanced for most views, spacious for long-form reading. Individual messages can override.' },
      { guidance: true, description: 'Use gap when top-level rows are independent (for example, LLM tool events or streamed blocks) and list spacing needs to be tuned separately from density.' },
      { guidance: true, description: 'Use the group prop on bubbles (first, middle, last) when a single sender sends multiple consecutive messages; it tightens corner radius to visually connect them.' },
      { guidance: true, description: 'Use XDSChatSystemMessage with variant="divider" for date separators and default for inline status notices like joins, leaves, or topic changes.' },
      { guidance: true, description: 'Put name on the first bubble and metadata on the last bubble in a message so they align with the bubble\'s inline padding.' },
      { guidance: true, description: 'Provide an emptyState prop so new users see a clear prompt to start a conversation instead of a blank screen.' },
      { guidance: true, description: 'Use the ghost bubble variant for AI-style responses that show rich content like code blocks or markdown without a visible boundary.' },
      { guidance: false, description: 'Don\'t use XDSChatSystemMessage for sender content; it has no avatar, alignment, or bubble. Use XDSChatMessage with a sender role instead.' },
      { guidance: false, description: 'Don\'t put long or multi-line content in a system message; keep it to a single short sentence. If you need more, use a bubble or a card.' },
      { guidance: false, description: 'Don\'t nest XDSChatMessage inside another XDSChatMessage; each message is a standalone article element with its own sender context.' },
      { guidance: false, description: 'Don\'t apply a fixed height directly on the message list; wrap it in a sized container and let the list fill with flex: 1.' },
      { guidance: false, description: 'Don\'t mix filled and ghost bubble variants within the same sender\'s messages; pick one style per side and use it consistently.' },
      { guidance: false, description: 'Don\'t place metadata or names on both the bubble and the message wrapper; pick one based on whether the content has a bubble boundary.' },
],
    anatomy: [
      { name: 'Message area', required: true, description: 'Scrollable region for messages. Renders children (typically XDSChatMessageList) in a flex column that pushes content to the bottom when the list is short.' },
      { name: 'Frosted glass dock', required: true, description: 'Sticky or fixed container at the bottom with a backdrop-blur layer. Houses the scroll button and composer.' },
      { name: 'Scroll-to-bottom button', required: false, description: 'Appears when the user scrolls up or new messages arrive. Defaults to XDSChatLayoutScrollButton; pass null to hide or a custom element to override.' },
      { name: 'Composer', required: true, description: 'The input area for sending messages, typically XDSChatComposer. Docked at the bottom inside the frosted glass layer.' },
      { name: 'Empty state', required: false, description: 'Centered placeholder shown when no messages exist. Use XDSEmptyState for a consistent look.' },
      { name: 'Avatar', required: false, description: 'A sender avatar rendered beside the message. Typically XDSAvatar with size="small". Hidden for system messages.' },
      { name: 'Name', required: false, description: 'Sender name above the message body. Place on the bubble when using bubbles, or on the message wrapper for raw content.' },
      { name: 'Content', required: true, description: 'The message body: one or more XDSChatMessageBubble elements, or any free-form ReactNode like images or tool calls.' },
      { name: 'Metadata', required: false, description: 'Timestamp, delivery status, and footer actions below the message. Place on the last bubble or on the message wrapper.' },
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsZh = {
  usage: {
    description: 'XDSChatMessageList 是聊天消息的可滚动容器。它以 flex 列的形式渲染子元素，使用 role="log" 确保无障碍性，通过上下文向子消息提供密度设置，并支持无限滚动以加载更早的消息。在 XDSChatLayout 内使用它可获得全页聊天体验（自动滚动和编辑器停靠），也可独立用于嵌入式消息面板。',
    bestPractices: [
      { guidance: true, description: '使用 MessageList > Message > Bubble 组合来获得一致的发送者感知样式和密度。' },
      { guidance: true, description: '设置 density 属性来全局控制间距：compact 用于侧边栏，balanced 用于大多数视图，spacious 用于长篇阅读。' },
      { guidance: true, description: '当同一发送者发送多条连续消息时，使用气泡的 group 属性（first、middle、last）来视觉上连接相关消息。' },
      { guidance: true, description: '使用 XDSChatSystemMessage 的 variant="divider" 作为日期分隔线，使用 default 作为内联状态通知。' },
      { guidance: true, description: '将 name 放在第一个气泡上，metadata 放在最后一个气泡上，使其与气泡的内边距对齐。' },
      { guidance: true, description: '提供 emptyState 属性，让新用户看到开始对话的提示，而不是空白屏幕。' },
      { guidance: true, description: '使用 ghost 气泡变体显示代码块或 Markdown 等富内容，无需可见边界。' },
      { guidance: false, description: '不要将 XDSChatSystemMessage 用于发送者内容，它没有头像、对齐或气泡。请使用带有发送者角色的 XDSChatMessage。' },
      { guidance: false, description: '不要在系统消息中放置冗长或多行内容，保持一句简短的话。如需更多内容，请使用气泡或卡片。' },
      { guidance: false, description: '不要将 XDSChatMessage 嵌套在另一个 XDSChatMessage 内，每条消息都是独立的 article 元素。' },
      { guidance: false, description: '不要直接在消息列表上应用固定高度，将其包裹在有尺寸的容器中，让列表以 flex: 1 填充。' },
      { guidance: false, description: '不要在同一发送者的消息中混用 filled 和 ghost 气泡变体，每一侧选择一种样式并保持一致。' },
      { guidance: false, description: '不要同时在气泡和消息包装器上放置 metadata 或 name，根据内容是否有气泡边界来选择。' },
    ],
    anatomy: [
      { name: 'Message area', required: true, description: 'Scrollable region for messages. Renders children (typically XDSChatMessageList) in a flex column that pushes content to the bottom when the list is short.' },
      { name: 'Frosted glass dock', required: true, description: 'Sticky or fixed container at the bottom with a backdrop-blur layer. Houses the scroll button and composer.' },
      { name: 'Scroll-to-bottom button', required: false, description: 'Appears when the user scrolls up or new messages arrive. Defaults to XDSChatLayoutScrollButton; pass null to hide or a custom element to override.' },
      { name: 'Composer', required: true, description: 'The input area for sending messages, typically XDSChatComposer. Docked at the bottom inside the frosted glass layer.' },
      { name: 'Empty state', required: false, description: 'Centered placeholder shown when no messages exist. Use XDSEmptyState for a consistent look.' },
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'AI chat components. Layout (MessageList>Message>Bubble+SystemMessage) + Composer (shell w/ slots, ContentEditable input w/ trigger menus, tokens, msg history, attachments)',
  usage: {
    description: 'XDSChatMessageList: scrollable msg container w/ role="log", density context, infinite scroll. Use inside XDSChatLayout for full-page chat or standalone for embedded panels.',
    bestPractices: [
      { guidance: true, description: 'MessageList > Message > Bubble for sender-aware styling.' },
      { guidance: true, description: 'Density prop controls global spacing: compact for sidebars, balanced default, spacious for reading.' },
      { guidance: true, description: 'gap tunes top-level row spacing separately from density for independent LLM/tool-event rows.' },
      { guidance: true, description: 'Group prop on bubbles (first/middle/last) for consecutive same-sender messages; tightens corner radius.' },
      { guidance: true, description: 'SystemMessage: divider variant for date breaks, default for status notices.' },
      { guidance: true, description: 'Name on first bubble, metadata on last; aligns with bubble inline padding.' },
      { guidance: true, description: 'Provide emptyState so new users see a prompt, not a blank screen.' },
      { guidance: true, description: 'Ghost bubble variant for rich AI content like code/markdown without visible boundary.' },
      { guidance: false, description: 'SystemMessage for sender content: no avatar/alignment/bubble. Use ChatMessage instead.' },
      { guidance: false, description: 'Long/multi-line system messages: keep to a single short sentence.' },
      { guidance: false, description: 'Nesting XDSChatMessage inside another: each is a standalone article.' },
      { guidance: false, description: 'Fixed height on message list directly: wrap in a sized container, let flex: 1 fill.' },
      { guidance: false, description: 'Mix filled and ghost variants in same sender\'s messages: pick one style per side.' },
      { guidance: false, description: 'Metadata/names on both bubble and wrapper: pick one.' },
],
  },
};
