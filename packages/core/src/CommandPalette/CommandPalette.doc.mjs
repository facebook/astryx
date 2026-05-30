// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */
export const docs = {
  name: 'CommandPalette',
  displayName: 'Command Palette',
  group: 'CommandPalette',
  category: 'Actions',
  keywords: [
    'command',
    'spotlight',
    'launcher',
    'omnibox',
    'quicksearch',
    'palette',
    'finder',
    'search',
    'modal',
    'dialog',
    'navigation',
  ],
  components: [
    {
      name: 'XDSCommandPalette',
      displayName: 'Command Palette',
      description:
        'Root component. Manages open state, search, keyboard navigation, and composition slots.',
      props: [
        {
          name: 'isOpen',
          type: 'boolean',
          description: 'Whether the command palette dialog is visible.',
          required: true,
        },
        {
          name: 'onOpenChange',
          type: '(isOpen: boolean) => void',
          description: 'Called when the palette visibility changes.',
          required: true,
        },
        {
          name: 'searchSource',
          type: 'XDSSearchSource<T>',
          description:
            'Search source providing items via search(query) and bootstrap(). Use createStaticSource for static lists.',
          required: true,
        },
        {
          name: 'input',
          type: 'ReactNode',
          description:
            'Input slot. Defaults to XDSCommandPaletteInput with standard behavior.',
          default: '<XDSCommandPaletteInput />',
          slotElements: [{__element: 'XDSTextInput', props: {label: 'Input', placeholder: 'Type here...'}}],
        },
        {
          name: 'footer',
          type: 'ReactNode',
          description:
            'Footer slot. Defaults to XDSCommandPaletteFooter showing keyboard hints.',
          default: '<XDSCommandPaletteFooter />',
          slotElements: [{__element: 'XDSText', props: {type: 'body'}, children: 'Footer content'}],
        },
        {
          name: 'renderItem',
          type: '(item: T, isSelected: boolean) => ReactNode',
          description:
            'Per-item render function. Auto-grouping by auxiliaryData.group is preserved. When omitted, renders label text.',
        },
        {
          name: 'emptySearchText',
          type: 'ReactNode',
          description: 'Content shown when a search query returns no results.',
          default: "'No results'",
        },
        {
          name: 'emptyBootstrapText',
          type: 'ReactNode',
          description:
            'Content shown when there is no search query and bootstrap() returns nothing.',
          default: "'Type to search'",
        },
        {
          name: 'value',
          type: 'string',
          description: 'Controlled selected value for picker mode.',
        },
        {
          name: 'onValueChange',
          type: '(value: string) => void',
          description: 'Called when the selected value changes in picker mode.',
        },
        {
          name: 'label',
          type: 'string',
          description: 'Accessible label for the command palette dialog.',
          default: "'Command palette'",
        },
        {
          name: 'width',
          type: 'number | string',
          description: 'Width of the dialog.',
          default: '640',
        },
        {
          name: 'maxHeight',
          type: 'number | string',
          description: 'Maximum height of the dialog.',
          default: '480',
        },
        {
          name: 'isInline',
          type: 'boolean',
          description: 'Renders command palette content inline without modal behavior. Automatically disables auto-focus on the input. For documentation previews and showcases only.',
          default: 'false',
        },
      ],
    },
    {
      name: 'XDSCommandPaletteInput',
      displayName: 'Command Palette Input',
      description:
        'Search input slot. Auto-focuses on mount. Wires to command palette context when used inside XDSCommandPalette.',
      props: [
        {
          name: 'placeholder',
          type: 'string',
          description: 'Placeholder text for the input.',
          default: "'Search...'",
        },
        {
          name: 'hasAutoFocus',
          type: 'boolean',
          description: 'Auto-focus the input when mounted. Automatically disabled when inside an inline command palette.',
          default: 'true',
        },
        {
          name: 'endContent',
          type: 'ReactNode',
          description:
            'Content rendered at the trailing end of the input, after the spinner. Use for clear buttons or keyboard shortcut hints.',
          slotElements: [
            {__element: 'XDSIcon', props: {icon: 'chevronDown', size: 'sm'}},
            {__element: 'XDSBadge', props: {label: '3'}},
          ],
        },
        {
          name: 'value',
          type: 'string',
          description:
            'Search value. When omitted inside XDSCommandPalette, reads from context.',
        },
        {
          name: 'onValueChange',
          type: '(value: string) => void',
          description:
            'Called when search value changes. When omitted inside XDSCommandPalette, writes to context.',
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            'StyleX styles for layout customization. Must be a stylex.create() value.',
        },
      ],
    },
    {
      name: 'XDSCommandPaletteList',
      displayName: 'Command Palette List',
      description:
        'Scrollable results container. Renders as a listbox for ARIA. Contains XDSCommandPaletteItem and XDSCommandPaletteGroup children.',
      props: [
        {
          name: 'children',
          type: 'ReactNode',
          description: 'Items, groups, and empty states.',
          required: true,
        },
        {
          name: 'label',
          type: 'string',
          description: 'Accessible label for the listbox.',
          default: "'Commands'",
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            'StyleX styles for layout customization. Must be a stylex.create() value.',
        },
      ],
    },
    {
      name: 'XDSCommandPaletteItem',
      displayName: 'Command Palette Item',
      description:
        'A selectable item. Accepts arbitrary children for full rendering control. Registers with context for keyboard navigation when inside XDSCommandPalette.',
      props: [
        {
          name: 'value',
          type: 'string',
          description: 'Unique value for identification and selection.',
          required: true,
        },
        {
          name: 'children',
          type: 'ReactNode',
          description:
            'Item content — render icons, descriptions, keyboard shortcuts, etc.',
          required: true,
        },
        {
          name: 'onSelect',
          type: '(value: string) => void',
          description: 'Called when this item is selected via click or Enter.',
        },
        {
          name: 'isHighlighted',
          type: 'boolean',
          description:
            'Whether this item has keyboard focus. Derived from context when inside XDSCommandPalette.',
          default: 'false',
        },
        {
          name: 'isSelected',
          type: 'boolean',
          description: 'Whether this item is selected in picker mode.',
          default: 'false',
        },
        {
          name: 'isDisabled',
          type: 'boolean',
          description: 'Whether the item is non-interactive.',
          default: 'false',
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            'StyleX styles for layout customization. Must be a stylex.create() value.',
        },
      ],
    },
    {
      name: 'XDSCommandPaletteGroup',
      displayName: 'Command Palette Group',
      description: 'Visual grouping with a heading label. Place inside XDSCommandPaletteList.',
      props: [
        {
          name: 'heading',
          type: 'string',
          description: 'Group heading text.',
          required: true,
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: 'XDSCommandPaletteItem children.',
          required: true,
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            'StyleX styles for layout customization. Must be a stylex.create() value.',
        },
      ],
    },
    {
      name: 'XDSCommandPaletteFooter',
      displayName: 'Command Palette Footer',
      description:
        'Footer showing keyboard navigation hints. Renders default arrow/Enter/Escape hints when no children are provided.',
      props: [
        {
          name: 'children',
          type: 'ReactNode',
          description:
            'Custom footer content. When omitted, renders default keyboard hints via XDSKbd.',
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            'StyleX styles for layout customization. Must be a stylex.create() value.',
        },
      ],
    },
    {
      name: 'XDSCommandPaletteEmpty',
      displayName: 'Command Palette Empty',
      description:
        'Empty state display for the results area. Rendered automatically by XDSCommandPalette for no-results and no-query states.',
      props: [
        {
          name: 'children',
          type: 'ReactNode',
          description: 'Message or content to display.',
          required: true,
        },
      ],
    },
  ],
  theming: {
    targets: [
      {className: 'xds-command-palette-footer'},
      {className: 'xds-command-palette-group'},
      {className: 'xds-command-palette-input'},
      {className: 'xds-command-palette-item'},
      {className: 'xds-command-palette-list'},
    ],
  },
  usage: {
    description: 'CommandPalette is a searchable dialog for quick access to commands, navigation, and actions. Use it as a keyboard-driven launcher powered by XDSSearchSource for filtering and selection.',
    bestPractices: [
      { guidance: true, description: 'Provide a searchSource with bootstrap results so users see useful options before typing.' },
      { guidance: true, description: 'Use auxiliaryData.group on items to automatically organize results into labeled sections.' },
      { guidance: false, description: 'Use CommandPalette for simple dropdowns or menus — use XDSMenu or XDSSelector for inline selections.' },
      { guidance: false, description: 'Add too many groups or items — curate results to keep the palette fast and scannable.' },
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsZh = {
  usage: {
    description: 'CommandPalette is a searchable dialog for quick access to commands, navigation, and actions. Use it as a keyboard-driven launcher powered by XDSSearchSource for filtering and selection.',
    bestPractices: [
      { guidance: true, description: 'Provide a searchSource with bootstrap results so users see useful options before typing.' },
      { guidance: true, description: 'Use auxiliaryData.group on items to automatically organize results into labeled sections.' },
      { guidance: false, description: 'Use CommandPalette for simple dropdowns or menus — use XDSMenu or XDSSelector for inline selections.' },
      { guidance: false, description: 'Add too many groups or items — curate results to keep the palette fast and scannable.' },
    ],
  },
  components: [
    {
      name: 'XDSCommandPalette',
      displayName: 'Command Palette',
      description: '根组件。管理打开状态、搜索、键盘导航和组合插槽。',
      propDescriptions: {
        isOpen: '命令面板对话框是否可见。',
        onOpenChange: '面板可见性变化时调用。',
        searchSource: '通过 search(query) 和 bootstrap() 提供条目的搜索源。',
        input: '输入插槽。默认为 XDSCommandPaletteInput。',
        footer: '页脚插槽。默认为 XDSCommandPaletteFooter 显示键盘提示。',
        renderItem: '每个条目的渲染函数。保留 auxiliaryData.group 自动分组。',
        emptySearchText: '搜索查询无结果时显示的内容。',
        emptyBootstrapText: '无搜索词且 bootstrap() 返回空时显示的内容。',
        value: '选择器模式下的受控选中值。',
        onValueChange: '选择器模式下选中值变化时调用。',
        label: '命令面板对话框的无障碍标签。',
        width: '对话框宽度。',
        maxHeight: '对话框最大高度。',
        isInline: '以内联方式渲染命令面板内容，不带模态行为。自动禁用输入框自动聚焦。仅用于文档预览和展示。',
      },
    },
    {
      name: 'XDSCommandPaletteInput',
      displayName: 'Command Palette Input',
      description: '搜索输入插槽。挂载时自动聚焦。在 XDSCommandPalette 内使用时连接到上下文。',
      propDescriptions: {
        placeholder: '输入框的占位文本。',
        hasAutoFocus: '挂载时自动聚焦输入框。内联命令面板中自动禁用。',
        endContent: '渲染在输入框末尾的内容，位于加载指示器之后。',
        value: '搜索值。在 XDSCommandPalette 内省略时从上下文读取。',
        onValueChange: '搜索值变化时调用。在 XDSCommandPalette 内省略时写入上下文。',
        xstyle: 'StyleX 布局自定义样式。必须是 stylex.create() 的值。',
      },
    },
    {
      name: 'XDSCommandPaletteList',
      displayName: 'Command Palette List',
      description: '可滚动的结果容器。作为 listbox 渲染以符合 ARIA 规范。',
      propDescriptions: {children: '条目、分组和空状态。', label: 'listbox 的无障碍标签。', xstyle: 'StyleX 布局自定义样式。必须是 stylex.create() 的值。'},
    },
    {
      name: 'XDSCommandPaletteItem',
      displayName: 'Command Palette Item',
      description: '可选择的条目。接受任意子元素以实现完整的渲染控制。',
      propDescriptions: {
        value: '用于标识和选择的唯一值。',
        children: '条目内容——渲染图标、描述、键盘快捷键等。',
        onSelect: '通过点击或 Enter 选择此条目时调用。',
        isHighlighted: '此条目是否具有键盘焦点。在 XDSCommandPalette 内从上下文派生。',
        isSelected: '此条目在选择器模式下是否被选中。',
        isDisabled: '条目是否为非交互状态。',
        xstyle: 'StyleX 布局自定义样式。必须是 stylex.create() 的值。',
      },
    },
    {
      name: 'XDSCommandPaletteGroup',
      displayName: 'Command Palette Group',
      description: '带标题标签的视觉分组。放置在 XDSCommandPaletteList 内。',
      propDescriptions: {heading: '分组标题文本。', children: 'XDSCommandPaletteItem 子元素。', xstyle: 'StyleX 布局自定义样式。必须是 stylex.create() 的值。'},
    },
    {
      name: 'XDSCommandPaletteFooter',
      displayName: 'Command Palette Footer',
      description: '显示键盘导航提示的页脚。未提供子元素时渲染默认方向键/Enter/Escape 提示。',
      propDescriptions: {children: '自定义页脚内容。省略时通过 XDSKbd 渲染默认键盘提示。', xstyle: 'StyleX 布局自定义样式。必须是 stylex.create() 的值。'},
    },
    {
      name: 'XDSCommandPaletteEmpty',
      displayName: 'Command Palette Empty',
      description: '结果区域的空状态展示。由 XDSCommandPalette 在无结果和无查询状态下自动渲染。',
      propDescriptions: {children: '要显示的消息或内容。'},
    },
  ],
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'searchSource-driven command palette dialog; filtering, keyboard nav, grouping, selection; same XDSSearchSource interface as XDSTypeahead',
  usage: {
    description: 'CommandPalette is a searchable dialog for quick access to commands, navigation, and actions. Use it as a keyboard-driven launcher powered by XDSSearchSource for filtering and selection.',
    bestPractices: [
      { guidance: true, description: 'Provide a searchSource with bootstrap results so users see useful options before typing.' },
      { guidance: true, description: 'Use auxiliaryData.group on items to automatically organize results into labeled sections.' },
      { guidance: false, description: 'Use CommandPalette for simple dropdowns or menus — use XDSMenu or XDSSelector for inline selections.' },
      { guidance: false, description: 'Add too many groups or items — curate results to keep the palette fast and scannable.' },
    ],
  },
  components: [
    {
      name: 'XDSCommandPalette',
      displayName: 'Command Palette',
      description: 'root; manages open state, search, keyboard nav, composition slots',
      propDescriptions: {
        isOpen: 'dialog visible',
        onOpenChange: 'called on visibility change',
        searchSource: 'provides items via search(query)+bootstrap()',
        input: 'input slot; default=XDSCommandPaletteInput',
        footer: 'footer slot; default=XDSCommandPaletteFooter w/ kbd hints',
        renderItem: 'per-item render fn; auto-grouping preserved',
        emptySearchText: 'shown when query returns no results',
        emptyBootstrapText: 'shown when no query+bootstrap() empty',
        value: 'controlled selected value for picker mode',
        onValueChange: 'called on selected value change',
        label: 'a11y label for dialog',
        width: 'dialog width',
        maxHeight: 'dialog max height',
        isInline: 'inline rendering for docs previews, no modal behavior, auto-disables input focus',
      },
    },
    {
      name: 'XDSCommandPaletteInput',
      displayName: 'Command Palette Input',
      description: 'search input; auto-focus on mount; wires to context inside XDSCommandPalette',
      propDescriptions: {
        placeholder: 'input placeholder text',
        hasAutoFocus: 'auto-focus on mount; auto-disabled in inline mode',
        endContent: 'trailing content after spinner',
        value: 'search value; reads context when omitted inside palette',
        onValueChange: 'called on change; writes context when omitted inside palette',
        xstyle: 'StyleX layout styles; must be stylex.create() value',
      },
    },
    {
      name: 'XDSCommandPaletteList',
      displayName: 'Command Palette List',
      description: 'scrollable results container; role=listbox',
      propDescriptions: {
        children: 'items, groups, empty states',
        label: 'a11y label for listbox',
        xstyle: 'StyleX layout styles; must be stylex.create() value',
      },
    },
    {
      name: 'XDSCommandPaletteItem',
      displayName: 'Command Palette Item',
      description: 'selectable item; arbitrary children; registers w/ context for kbd nav',
      propDescriptions: {
        value: 'unique id for selection',
        children: 'item content — icons, descriptions, shortcuts',
        onSelect: 'called on click or Enter',
        isHighlighted: 'keyboard focus; derived from context inside palette',
        isSelected: 'selected in picker mode',
        isDisabled: 'non-interactive',
        xstyle: 'StyleX layout styles; must be stylex.create() value',
      },
    },
    {
      name: 'XDSCommandPaletteGroup',
      displayName: 'Command Palette Group',
      description: 'group w/ heading label; inside XDSCommandPaletteList',
      propDescriptions: {
        heading: 'group heading text',
        children: 'XDSCommandPaletteItem children',
        xstyle: 'StyleX layout styles; must be stylex.create() value',
      },
    },
    {
      name: 'XDSCommandPaletteFooter',
      displayName: 'Command Palette Footer',
      description: 'footer w/ kbd hints; default=arrow/Enter/Escape hints via XDSKbd',
      propDescriptions: {
        children: 'custom content; default renders kbd hints',
        xstyle: 'StyleX layout styles; must be stylex.create() value',
      },
    },
    {
      name: 'XDSCommandPaletteEmpty',
      displayName: 'Command Palette Empty',
      description: 'empty state; auto-rendered by palette for no-results+no-query states',
      propDescriptions: {
        children: 'message or content to display',
      },
    },
  ],
};
