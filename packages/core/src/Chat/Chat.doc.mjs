/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Chat',
  description:
    'Chat components for AI chat interfaces. Layout (MessageList, Message, Bubble, SystemMessage) + Composer (Composer, ComposerInput with trigger menus, ComposerAttachments).',
  keywords: ['chat', 'message', 'bubble', 'conversation', 'ai', 'assistant', 'thread', 'system-message', 'composer', 'mention', 'trigger', 'typeahead', 'token', 'imperative', 'tokenized-text'],
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
    'Imperative handle on ComposerInput for programmatic token/text insertion',
    'Tokenized text rendering in message bubbles via XDSChatMessageTokenizedText',
    'XDSSearchSource integration — reuses Typeahead search sources',
    'Concentric radius — inner elements follow outer shell curvature',
    'Themeable via --composer-radius and --composer-padding CSS vars',
  ],
  theming: {
    targets: [
      {className: 'xds-chat-composer', visualProps: ['density']},
      {className: 'xds-chat-composer-input'},
      {className: 'xds-chat-composer-attachments', visualProps: ['collapsed']},
      {className: 'xds-chat-message', visualProps: ['sender']},
      {className: 'xds-chat-message-bubble', visualProps: ['sender', 'variant']},
      {className: 'xds-chat-message-list', visualProps: ['density']},
      {className: 'xds-chat-system-message', visualProps: ['variant']},
      {className: 'xds-chat-tool-calls'},
      {className: 'xds-trigger-menu'},
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
      description: 'Layout shell for a chat composer. Arranges named slots (attachments, header, input, footer, send) with page-radius container, hover/focus shadows, and concentric inner radius for child elements.',
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
        {name: 'headerActions', type: 'ReactNode', description: 'Slot: left-aligned header actions (attach, mention buttons). Use icon-only size="sm" buttons.'},
        {name: 'headerContext', type: 'ReactNode', description: 'Slot: right-aligned contextual info in the header (context window usage, XDSProgressBar, supporting text).'},
        {name: 'input', type: 'ReactNode', description: 'Slot: custom input element. Replaces the default textarea. Use XDSChatComposerInput for trigger menus.'},
        {name: 'footerActions', type: 'ReactNode', description: 'Slot: left-aligned footer actions (model selector, etc).'},
        {name: 'sendActions', type: 'ReactNode', description: 'Slot: actions to the left of the send button.'},
        {name: 'sendButton', type: 'ReactNode', description: 'Slot: custom send button. Replaces the default send/stop button.'},
        {name: 'status', type: "{ type: 'error' | 'warning'; message?: string }", description: 'Status message rendered below (or above) the composer.'},
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
      description: 'ContentEditable-based rich input with trigger menus (@ mentions, / commands), inline tokens, serialization, message history, and paste/drop file handling. Uses XDSSearchSource for search. Exposes an imperative handle for programmatic control.',
      props: [
        {name: 'ref', type: 'React.Ref<XDSChatComposerInputHandle>', description: 'Imperative handle ref exposing insertToken, insertText, focus, and getValue.'},
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
    {
      name: 'XDSChatMessageTokenizedText',
      description: 'Renders text with token patterns replaced by inline XDSBadge components. Use inside XDSChatMessageBubble to display @mentions or other tokens as styled badges.',
      props: [
        {name: 'children', type: 'string', description: 'The message text containing token patterns.', required: true},
        {name: 'tokens', type: 'XDSChatMessageTokenConfig[]', description: 'Token definitions. Each has pattern (string to match), label (display text), and optional variant.'},
      ],
      examples: [
        {label: 'With mentions', code: `<XDSChatMessageBubble>\n  <XDSChatMessageTokenizedText\n    tokens={[{pattern: '@cindy', label: '@Cindy Zhang', variant: 'blue'}]}\n  >\n    Hey @cindy, can you review this?\n  </XDSChatMessageTokenizedText>\n</XDSChatMessageBubble>`},
      ],
    },
  ],
  usage: {
    summary: 'Chat components for building AI chat interfaces, including message lists, message bubbles, and a composer.',
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsZh = {
  description:
    'AI 聊天界面组件。布局（MessageList、Message、Bubble、SystemMessage）+ 编写器（Composer、ComposerInput 触发菜单、ComposerAttachments）。',
  features: [
    '组合模型 — MessageList > Message > Bubble',
    '根据发送者自动调整样式（user、assistant、system），通过上下文传递',
    '自动滚动，带有"新消息"指示器',
    '通过 onScrollToTopAction 和 useTransition 实现无限滚动',
    '密度变体：compact、balanced、spacious（通过上下文传递）',
    '系统消息，可选分割线变体用于日期分隔',
    '自由子元素 — 并非所有内容都需要气泡包裹',
    '时间戳显示：悬停或标题',
    '消息状态指示器（sending、sent、delivered、read、error）',
    'role="log" 配合 aria-live="polite" 实现无障碍访问',
    '编写器布局外壳，具有命名语义插槽',
    'ContentEditable 输入框，支持 @ 提及和 / 命令触发菜单',
    'ComposerInput 命令式句柄，支持编程式插入标记/文本',
    '通过 XDSChatMessageTokenizedText 在消息气泡中渲染标记文本',
    'XDSSearchSource 集成 — 复用 Typeahead 搜索源',
    '同心圆角 — 内部元素跟随外部外壳曲率',
    '通过 --composer-radius 和 --composer-padding CSS 变量实现主题化',
  ],
  components: [
    {
      name: 'XDSChatMessageList',
      description: '可滚动的消息容器，支持自动滚动和无限滚动。',
      propDescriptions: {
        children: '消息元素，通常是 XDSChatMessage 或 XDSChatSystemMessage。',
        hasAutoScroll: '在接近底部时，新内容触发自动滚动到底部。',
        scrollThreshold: '距底部的距离（像素），在此范围内新内容触发自动滚动。',
        emptyState: '列表无消息时显示的内容。',
        onScrollToTopAction: '用户滚动到顶部时触发的异步操作。用于加载更早的消息。',
        density: '视觉密度，通过上下文传递给子消息。',
      },
    },
    {
      name: 'XDSChatMessage',
      description: '发送者上下文包装器，根据发送者角色处理头像、名称和对齐方式。',
      propDescriptions: {
        sender: '消息发送者，控制对齐和布局。',
        children: '自由内容：气泡、资源列表、工具调用、图片。',
        avatar: '消息旁边渲染的头像元素。通常是 XDSAvatar。',
        name: '内容上方显示的发送者名称。',
        density: '视觉密度。未设置时从列表上下文继承。',
      },
    },
    {
      name: 'XDSChatMessageBubble',
      description: '样式化的气泡容器，从父上下文读取发送者信息进行自动样式化。',
      propDescriptions: {
        children: '气泡内容：文本、XDSMarkdown 或任何 ReactNode。',
        timestamp: '气泡的时间戳。Date 类型自动格式化。',
        timestampDisplay: '时间戳的显示方式。',
        footer: '气泡下方的页脚，用于反应、操作、已读回执。',
        status: '消息状态指示器。仅对用户消息渲染。',
      },
    },
    {
      name: 'XDSChatSystemMessage',
      description: '居中的系统/通知消息，用于日期分隔、状态更新和非发送者内容。',
      propDescriptions: {
        children: '系统消息内容。',
        variant: '视觉变体。divider 在两侧添加水平线。',
        icon: '文本前渲染的图标。',
        timestamp: '文本后显示的时间戳。',
      },
    },
    {
      name: 'XDSChatComposer',
      description: '聊天编写器布局外壳。排列命名插槽（附件、标题栏、输入、页脚、发送），带有页面圆角容器和同心内圆角。',
      propDescriptions: {
        onSubmit: '用户提交消息时调用。',
        onStop: '用户请求停止生成时调用。',
        isStreaming: '助手是否正在流式输出。',
        value: '受控输入值。',
        onChange: '受控模式的变更处理器。',
        placeholder: '占位文本。',
        isDisabled: '禁用编写器。',
        density: '视觉密度。',
        attachments: '插槽：输入上方的附件标签。使用 XDSChatComposerAttachments。',
        headerActions: '插槽：标题左侧操作按钮（附件、提及按钮）。使用仅图标 size="sm" 按钮。',
        headerContext: '插槽：标题右侧上下文信息（上下文窗口使用情况、XDSProgressBar、辅助文本）。',
        input: '插槽：自定义输入元素。替换默认文本区域。使用 XDSChatComposerInput 实现触发菜单。',
        footerActions: '插槽：左对齐的页脚操作（模型选择器等）。',
        sendActions: '插槽：发送按钮左侧的操作。',
        sendButton: '插槽：自定义发送按钮。替换默认的发送/停止按钮。',
        status: '编写器下方（或上方）的状态消息。',
        statusPosition: '状态渲染位置。',
      },
    },
    {
      name: 'XDSChatComposerInput',
      description: '基于 ContentEditable 的富文本输入，支持触发菜单（@ 提及、/ 命令）、内联标记、序列化、消息历史和粘贴/拖放文件处理。提供命令式句柄用于编程式控制。',
      propDescriptions: {
        ref: '命令式句柄引用，暴露 insertToken、insertText、focus 和 getValue。',
        value: '受控值。',
        onChange: '变更处理器。',
        placeholder: '占位文本。',
        maxRows: '滚动前的最大行数。',
        triggers: '菜单的触发定义。每个触发器有 character、searchSource 和 onSelect。',
        debounceMs: '异步搜索源的去抖动延迟。',
        hasHistory: '启用 ArrowUp/Down 消息回溯。',
        label: '无障碍标签。',
        isDisabled: '禁用状态。',
        onPaste: '粘贴处理器。',
        onFiles: '文件拖放/粘贴处理器。',
        onSubmit: '提交处理器（不按 Shift 的 Enter）。',
      },
    },
    {
      name: 'XDSChatComposerAttachments',
      description: '编写器内附件项目的弹性换行容器。',
      propDescriptions: {
        children: '要渲染的附件项目。',
        count: '附件总数。超过可见子元素时显示折叠/展开切换。',
      },
    },
    {
      name: 'XDSChatMessageTokenizedText',
      description: '渲染带有标记模式的文本，将匹配的模式替换为内联 XDSBadge 组件。在 XDSChatMessageBubble 内使用，以徽章样式显示 @提及或其他标记。',
      propDescriptions: {
        children: '包含标记模式的消息文本。',
        tokens: '标记定义。每个包含 pattern（匹配字符串）、label（显示文本）和可选 variant。',
      },
    },
  ],
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'AI chat components. Layout (MessageList>Message>Bubble+SystemMessage) + Composer (shell w/ slots, ContentEditable input w/ trigger menus, attachments)',
  features: [
    'composition: MessageList > Message > Bubble',
    'sender-aware styling (user/assistant/system) via context',
    'auto-scroll w/ "New messages" indicator',
    'infinite scroll via onScrollToTopAction w/ useTransition',
    'density: compact/balanced/spacious (flows via context)',
    'system msgs w/ optional divider variant for date separators',
    'free-form children; not all content needs bubble',
    'timestamp: hover or header display',
    'msg status indicators (sending/sent/delivered/read/error)',
    'role="log" + aria-live="polite" for a11y',
    'composer layout shell w/ named semantic slots',
    'ContentEditable input w/ @ mention + / command trigger menus',
    'imperative handle on ComposerInput for programmatic token/text insert',
    'tokenized text rendering in msg bubbles via XDSChatMessageTokenizedText',
    'XDSSearchSource integration; reuses Typeahead search sources',
    'concentric radius; inner elements follow outer shell curvature',
    'themeable via --composer-radius + --composer-padding CSS vars',
  ],
  components: [
    {
      name: 'XDSChatMessageList',
      description: 'scrollable msg container w/ auto-scroll + infinite scroll',
      propDescriptions: {
        children: 'msg elements (XDSChatMessage or XDSChatSystemMessage)',
        hasAutoScroll: 'auto-scroll to bottom on new content near bottom',
        scrollThreshold: 'px from bottom to trigger auto-scroll',
        emptyState: 'content when no msgs',
        onScrollToTopAction: 'async action at scroll top; load older msgs',
        density: 'visual density; flows to children via context',
      },
    },
    {
      name: 'XDSChatMessage',
      description: 'sender context wrapper; handles avatar+name+alignment by sender role',
      propDescriptions: {
        sender: 'who sent; controls alignment+layout',
        children: 'free-form: bubbles, assets, tool calls, images',
        avatar: 'avatar element beside msg; typically XDSAvatar',
        name: 'sender name above content',
        density: 'visual density; inherited from list context if unset',
      },
    },
    {
      name: 'XDSChatMessageBubble',
      description: 'styled bubble container; reads sender from context for auto-styling',
      propDescriptions: {
        children: 'bubble content: text, XDSMarkdown, any ReactNode',
        timestamp: 'bubble timestamp; Date auto-formatted',
        timestampDisplay: 'timestamp display mode',
        footer: 'footer below bubble for reactions+actions+read receipts',
        status: 'msg status indicator; only for user msgs',
      },
    },
    {
      name: 'XDSChatSystemMessage',
      description: 'centered system/notice msg for date separators+status updates',
      propDescriptions: {
        children: 'system msg content',
        variant: 'visual variant; divider adds horizontal lines',
        icon: 'icon before text',
        timestamp: 'timestamp after text',
      },
    },
    {
      name: 'XDSChatComposer',
      description: 'composer layout shell; named slots (attachments/header/input/footer/send) w/ page-radius + concentric inner radius',
      propDescriptions: {
        onSubmit: 'submit msg handler',
        onStop: 'stop generation handler',
        isStreaming: 'assistant streaming state',
        value: 'controlled input value',
        onChange: 'controlled change handler',
        placeholder: 'placeholder text',
        isDisabled: 'disabled state',
        density: 'visual density',
        attachments: 'slot: attachment chips above input; use XDSChatComposerAttachments',
        headerActions: 'slot: left header actions (attach, mention); icon-only sm buttons',
        headerContext: 'slot: right header context info (window usage, XDSProgressBar, text)',
        input: 'slot: custom input; replaces default textarea; use XDSChatComposerInput for triggers',
        footerActions: 'slot: left footer actions (model selector etc)',
        sendActions: 'slot: actions left of send btn',
        sendButton: 'slot: custom send btn; replaces default',
        status: 'status msg below/above composer',
        statusPosition: 'status render position',
      },
    },
    {
      name: 'XDSChatComposerInput',
      description: 'ContentEditable rich input w/ trigger menus (@/commands), inline tokens, serialization, msg history, paste/drop files, imperative handle',
      propDescriptions: {
        ref: 'imperative handle ref (insertToken/insertText/focus/getValue)',
        value: 'controlled value',
        onChange: 'change handler',
        placeholder: 'placeholder text',
        maxRows: 'max rows before scrolling',
        triggers: 'trigger defs for menus; each has character+searchSource+onSelect',
        debounceMs: 'debounce for async search sources',
        hasHistory: 'ArrowUp/Down msg recall',
        label: 'a11y label',
        isDisabled: 'disabled state',
        onPaste: 'paste handler',
        onFiles: 'file drop/paste handler',
        onSubmit: 'submit handler (Enter w/o Shift)',
      },
    },
    {
      name: 'XDSChatComposerAttachments',
      description: 'flex-wrap container for attachment items in composer',
      propDescriptions: {
        children: 'attachment items to render',
        count: 'total count; shows collapse/expand when exceeds visible',
      },
    },
    {
      name: 'XDSChatMessageTokenizedText',
      description: 'renders text w/ token patterns replaced by inline badges; use in bubble for @mentions',
      propDescriptions: {
        children: 'msg text w/ token patterns',
        tokens: 'token defs: pattern+label+variant',
      },
    },
  ],
};
