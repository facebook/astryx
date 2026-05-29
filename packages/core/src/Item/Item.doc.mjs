// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Item',
  displayName: 'Item',
  group: 'Item',
  category: 'Lists',
  keywords: ["item","list-item","media-object","row","cell","entity","contact","notification","preview"],
  playground: {
    defaults: {
      label: 'Item label',
      description: 'Supporting text',
    },
  },
  theming: {
    targets: [
      {className: 'xds-item', visualProps: ['density', 'align']},
    ],
  },
  components: [
    {
      name: 'XDSItem',
      displayName: 'Item',
      description: 'A universal item primitive that unifies the "media + label + description + trailing content" layout pattern. Use as a building block for list items, menu items, contact rows, notifications, and more.',
      props: [
        {name: 'label', type: 'ReactNode', description: 'Primary text identifying this item. Accepts string (auto-truncated) or ReactNode (for rich content).', required: true},
        {name: 'media', type: 'ReactNode', description: 'Leading visual — avatar, icon, image, or any ReactNode.', slotElements: [{__element: 'XDSAvatar', props: {size: 'sm'}}, {__element: 'XDSIcon', props: {icon: 'user', size: 'sm'}}]},
        {name: 'description', type: 'ReactNode', description: 'Secondary text — subtitle, description, or supporting info.'},
        {name: 'trailing', type: 'ReactNode', description: 'Trailing content — badges, metadata, timestamps, action buttons. Positioned at the end, flex-shrink: 0.', slotElements: [{__element: 'XDSBadge', props: {label: 3}}, {__element: 'XDSText', props: {color: 'secondary'}, children: '2h ago'}]},
        {name: 'as', type: "'div' | 'li' | 'span'", description: 'HTML element to render as the root.', default: "'div'"},
        {name: 'startAdornment', type: 'ReactNode', description: 'Content rendered before the media slot as a direct flex child, without a wrapper element.'},
        {name: 'align', type: "'center' | 'start'", description: 'Vertical alignment of media and trailing slots.', default: "'center'"},
        {name: 'density', type: "'default' | 'compact'", description: 'Spacing density. "default" uses 8px block padding, "compact" uses 4px.', default: "'default'"},
        {name: 'labelLines', type: 'number', description: 'Max lines before label truncates with ellipsis.'},
        {name: 'descriptionLines', type: 'number', description: 'Max lines before description truncates with ellipsis.'},
        {name: 'onClick', type: '(event: MouseEvent) => void', description: 'Click handler. Makes the item clickable with button semantics.'},
        {name: 'href', type: 'string', description: 'Link URL. Makes the item a link via an invisible anchor element.'},
        {name: 'target', type: "'_blank' | '_self'", description: 'Link target. Only used with href. target="_blank" automatically adds noopener noreferrer.'},
        {name: 'rel', type: 'string', description: 'Link relationship tokens. noopener noreferrer are merged automatically for target="_blank".'},
        {name: 'isHighlighted', type: 'boolean', description: 'Highlighted state (hover/keyboard focus appearance).', default: 'false'},
        {name: 'isSelected', type: 'boolean', description: 'Selected state.', default: 'false'},
        {name: 'isDisabled', type: 'boolean', description: 'Disabled state.', default: 'false'},
        {name: 'ref', type: 'React.Ref<HTMLDivElement>', description: 'Ref forwarded to the root element.'},
        {name: 'xstyle', type: 'StyleXStyles', description: 'StyleX styles for layout customization. Must be a stylex.create() value.'},
        {name: 'data-testid', type: 'string', description: 'Test selector for automated testing frameworks.'},
      ],
    },
  ],
  usage: {
    description:
      'A single, flexible item primitive that unifies the "media + label + description + trailing content" pattern across XDS. Use it wherever you need a structured row — dropdown menus, selectors, contact lists, notifications, file browsers, and activity feeds.',
    bestPractices: [
      {guidance: true, description: 'Use named slots (media, label, description, trailing) for the common layout. These cover the 80% case.'},
      {guidance: true, description: 'Use density="compact" for menus and dense lists, "default" for standalone items and spacious layouts.'},
      {guidance: true, description: 'Set labelLines and descriptionLines to control truncation when content length varies.'},
      {guidance: true, description: 'Use align="start" when media or trailing content is taller than a single line of text.'},
      {guidance: false, description: "Don't nest interactive elements (buttons, links) inside an interactive XDSItem — it creates confusing focus and click targets."},
      {guidance: false, description: "Don't use XDSItem for navigation between views — use proper navigation components instead."},
      {guidance: false, description: "Don't add read/unread or inbox-specific behavior directly — compose a thin wrapper like XDSPreviewItem instead."},
    ],
    anatomy: [
      {name: 'Media', required: false, description: 'Leading visual — avatar, icon, image, or status indicator.'},
      {name: 'Label', required: true, description: 'Primary text identifying the item.'},
      {name: 'Description', required: false, description: 'Secondary supporting text below the label.'},
      {name: 'Trailing', required: false, description: 'End-aligned content — badges, timestamps, or action buttons.'},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsZh = {
  components: [
    {
      name: 'XDSItem',
      displayName: 'Item',
      description: '通用项目原语，统一 "媒体 + 标签 + 描述 + 尾部内容" 布局模式。用作列表项、菜单项、联系人行、通知等的构建块。',
      propDescriptions: {
        label: '标识此项目的主要文本。接受字符串（自动截断）或 ReactNode（用于富内容）。',
        media: '前导视觉 — 头像、图标、图片或任何 ReactNode。',
        description: '次要文本 — 副标题、描述或辅助信息。',
        trailing: '尾部内容 — 徽章、元数据、时间戳、操作按钮。定位在末端。',
        as: '根元素的 HTML 元素。',
        startAdornment: '在媒体插槽之前渲染的内容，作为直接 flex 子元素，无包装元素。',
        align: '媒体和尾部插槽的垂直对齐方式。',
        density: '间距密度。"default" 使用 8px 块内距，"compact" 使用 4px。',
        labelLines: '标签截断前的最大行数。',
        descriptionLines: '描述截断前的最大行数。',
        onClick: '点击处理函数。使项目可点击，具有按钮语义。',
        href: '链接 URL。通过不可见锚点元素使项目成为链接。',
        target: '链接目标。仅与 href 一起使用。target="_blank" 会自动添加 noopener noreferrer。',
        rel: '链接关系标记。target="_blank" 会自动合并 noopener noreferrer。',
        isHighlighted: '高亮状态（悬停/键盘焦点外观）。',
        isSelected: '选中状态。',
        isDisabled: '禁用状态。',
        ref: '转发到根元素的引用。',
        xstyle: 'StyleX 样式，用于布局自定义。必须是 stylex.create() 的值。',
        'data-testid': '自动化测试的选择器。',
      },
    },
  ],
  usage: {
    description:
      '通用项目原语，统一 XDS 中 "媒体 + 标签 + 描述 + 尾部内容" 的布局模式。适用于下拉菜单、选择器、联系人列表、通知、文件浏览器和活动流等场景。',
    bestPractices: [
      {guidance: true, description: '使用命名插槽（media、label、description、trailing）处理常见布局。'},
      {guidance: true, description: '菜单和密集列表使用 density="compact"，独立项目使用 "default"。'},
      {guidance: true, description: '设置 labelLines 和 descriptionLines 控制内容长度不定时的截断。'},
      {guidance: true, description: '当媒体或尾部内容高于单行文本时使用 align="start"。'},
      {guidance: false, description: '不要在交互式 XDSItem 内嵌套交互元素（按钮、链接）。'},
      {guidance: false, description: '不要使用 XDSItem 进行视图间导航 — 使用适当的导航组件。'},
      {guidance: false, description: '不要直接添加已读/未读行为 — 组合一个薄包装器如 XDSPreviewItem。'},
    ],
    anatomy: [
      {name: '媒体', required: false, description: '前导视觉 — 头像、图标、图片或状态指示器。'},
      {name: '标签', required: true, description: '标识项目的主要文本。'},
      {name: '描述', required: false, description: '标签下方的次要辅助文本。'},
      {name: '尾部', required: false, description: '末端对齐内容 — 徽章、时间戳或操作按钮。'},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'universal item primitive w/ media+label+description+trailing layout. building block for list items, menu items, contacts, notifications',
  usage: {
    description:
      'Flexible item primitive unifying the "media + label + description + trailing" pattern. Use for structured rows in menus, lists, contacts, notifications, file browsers.',
    bestPractices: [
      {guidance: true, description: 'Named slots (media, label, description, trailing) for the 80% case.'},
      {guidance: true, description: 'density="compact" for menus/dense lists, "default" for spacious layouts.'},
      {guidance: true, description: 'labelLines/descriptionLines for truncation control.'},
      {guidance: true, description: 'align="start" when media/trailing is taller than one text line.'},
      {guidance: false, description: "Don't nest interactive elements inside interactive XDSItem."},
      {guidance: false, description: "Don't use for view navigation — use nav components."},
      {guidance: false, description: "Don't add inbox-specific behavior — compose a wrapper."},
    ],
  },
  components: [
    {
      name: 'XDSItem',
      displayName: 'Item',
      description: 'universal item primitive w/ media+label+description+trailing layout',
      propDescriptions: {
        label: 'Primary text. String auto-truncates; ReactNode for rich content.',
        media: 'Leading visual — avatar, icon, image, ReactNode.',
        description: 'Secondary text below label.',
        trailing: 'End-aligned content — badges, timestamps, actions.',
        as: 'Root HTML element.',
        startAdornment: 'Content before media slot as direct flex child, no wrapper.',
        align: 'Vertical alignment of media/trailing slots.',
        density: 'Spacing: "default" (8px) or "compact" (4px).',
        labelLines: 'Max label lines before truncation.',
        descriptionLines: 'Max description lines before truncation.',
        onClick: 'Click handler; enables button semantics.',
        href: 'Link URL; enables anchor semantics.',
        target:
          'Link target, only with href. target="_blank" auto-adds noopener noreferrer.',
        rel: 'Link relationship tokens. noopener noreferrer are merged for target="_blank".',
        isHighlighted: 'Highlighted state.',
        isSelected: 'Selected state.',
        isDisabled: 'Disabled state.',
        xstyle: 'StyleX layout styles; must be stylex.create() value.',
        'data-testid': 'Test selector.',
      },
    },
  ],
};
