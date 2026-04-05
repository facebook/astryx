/** @type {import('../docs-types').ComponentDoc} */
export const docs = {
  name: 'CommandPalette',
  description:
    'A searchSource-driven command palette dialog. Provide a search source and get filtering, keyboard navigation, grouping, and selection. Uses the same XDSSearchSource interface as XDSTypeahead.',
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
  features: [
    'searchSource: same XDSSearchSource interface as XDSTypeahead — static, async, or hybrid',
    'Auto-grouping: items with auxiliaryData.group are auto-grouped in default rendering',
    'createStaticSource: utility for static lists with optional keyword matching',
    'Async support: spinner shows in input while search resolves',
    'Keyboard navigation: arrow keys, Enter to select, Escape to close',
    'Picker mode: value/onValueChange for persistent selection',
    'Composable: XDSCommandPaletteInput, XDSCommandPaletteList, XDSCommandPaletteGroup, XDSCommandPaletteItem, XDSCommandPaletteFooter, XDSCommandPaletteEmpty',
    'renderItem: custom per-item render while preserving auto-grouping',
  ],
  components: [
    {
      name: 'XDSCommandPalette',
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
        },
        {
          name: 'footer',
          type: 'ReactNode',
          description:
            'Footer slot. Defaults to XDSCommandPaletteFooter showing keyboard hints.',
          default: '<XDSCommandPaletteFooter />',
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
      ],
      examples: [
        {
          label: 'Static source',
          code: `const source = createStaticSource([
  {id: 'home', label: 'Home'},
  {id: 'settings', label: 'Settings'},
]);

<XDSCommandPalette
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  searchSource={source}
/>`,
        },
      ],
    },
    {
      name: 'XDSCommandPaletteInput',
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
          description: 'Auto-focus the input when mounted.',
          default: 'true',
        },
        {
          name: 'endContent',
          type: 'ReactNode',
          description:
            'Content rendered at the trailing end of the input, after the spinner. Use for clear buttons or keyboard shortcut hints.',
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
      examples: [
        {
          label: 'Custom placeholder',
          code: `<XDSCommandPalette isOpen={isOpen} onOpenChange={setIsOpen} searchSource={source}
  input={<XDSCommandPaletteInput placeholder="Search commands..." />}
/>`,
        },
      ],
    },
    {
      name: 'XDSCommandPaletteList',
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
      examples: [
        {
          label: 'Basic',
          code: `<XDSCommandPaletteList>
  <XDSCommandPaletteItem value="home" onSelect={goHome}>
    Go Home
  </XDSCommandPaletteItem>
</XDSCommandPaletteList>`,
        },
      ],
    },
    {
      name: 'XDSCommandPaletteItem',
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
      examples: [
        {
          label: 'With icon and shortcut',
          code: `<XDSCommandPaletteItem value="settings" onSelect={() => navigate('/settings')}>
  <XDSIcon name="settings" size="sm" />
  Settings
  <XDSKbd keys={['⌘', ',']} />
</XDSCommandPaletteItem>`,
        },
      ],
    },
    {
      name: 'XDSCommandPaletteGroup',
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
      examples: [
        {
          label: 'Basic',
          code: `<XDSCommandPaletteGroup heading="Navigation">
  <XDSCommandPaletteItem value="home" onSelect={goHome}>Home</XDSCommandPaletteItem>
  <XDSCommandPaletteItem value="settings" onSelect={goSettings}>Settings</XDSCommandPaletteItem>
</XDSCommandPaletteGroup>`,
        },
      ],
    },
    {
      name: 'XDSCommandPaletteFooter',
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
      examples: [
        {
          label: 'Default hints',
          code: `<XDSCommandPalette isOpen={isOpen} onOpenChange={setIsOpen} searchSource={source}
  footer={<XDSCommandPaletteFooter />}
/>`,
        },
      ],
    },
    {
      name: 'XDSCommandPaletteEmpty',
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
      examples: [
        {
          label: 'Custom empty state',
          code: `<XDSCommandPalette
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  searchSource={source}
  emptySearchText={
    <XDSCommandPaletteEmpty>No commands found</XDSCommandPaletteEmpty>
  }
/>`,
        },
      ],
    },
  ],
  examples: [
    {
      label: 'Static source with createStaticSource',
      code: `const source = createStaticSource([
  {id: 'home', label: 'Home'},
  {id: 'settings', label: 'Settings'},
  {id: 'logout', label: 'Sign out'},
]);

function MyCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <XDSCommandPalette
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      searchSource={source}
    />
  );
}`,
    },
    {
      label: 'Grouped items with renderItem',
      code: `<XDSCommandPalette
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  searchSource={source}
  renderItem={(item) => (
    <>
      <XDSIcon name={item.auxiliaryData.icon} size="sm" />
      {item.label}
    </>
  )}
/>`,
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
  accessibility: [
    'Dialog uses XDSDialog — native <dialog> with showModal() for correct modal ARIA semantics.',
    'Input renders as a search input with combobox role, aria-expanded, and aria-controls pointing to the list.',
    'List renders as role="listbox" with aria-label.',
    'Items render as role="option" with aria-selected.',
    'Keyboard navigation uses useCombobox from XDSSelector for consistent arrow key, Home/End, Enter, and Escape behavior.',
    'Spinner in input uses role="status" to announce loading to screen readers.',
  ],
  keyboard:
    'Arrow Up/Down: navigate items; Enter: select highlighted item; Escape: close palette; Tab: moves focus to footer actions',
  notes: [
    'Uses XDSSearchSource interface — the same as XDSTypeahead. Any source compatible with XDSTypeahead works here.',
    'createStaticSource supports keyword-based matching in addition to substring matching.',
    'Auto-grouping reads auxiliaryData.group from each item — no extra config needed.',
    'Picker mode (value/onValueChange) keeps the palette open and tracks a persistent selection.',
    'The isBusy signal from searchSource drives the spinner in XDSCommandPaletteInput automatically.',
  ],
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsZh = {
  description:
    '由 searchSource 驱动的命令面板对话框。提供搜索源，即可获得过滤、键盘导航、分组和选择功能。与 XDSTypeahead 使用相同的 XDSSearchSource 接口。',
  features: [
    'searchSource：与 XDSTypeahead 相同的 XDSSearchSource 接口——静态、异步或混合',
    '自动分组：auxiliaryData.group 中的项目在默认渲染中自动分组',
    'createStaticSource：用于静态列表的工具函数，支持关键词匹配',
    '异步支持：搜索解析时在输入框中显示加载指示器',
    '键盘导航：方向键、Enter 选择、Escape 关闭',
    '选择器模式：通过 value/onValueChange 实现持久选择',
    '可组合：XDSCommandPaletteInput、XDSCommandPaletteList、XDSCommandPaletteGroup 等子组件',
    'renderItem：自定义每个条目的渲染，同时保留自动分组',
  ],
  accessibility: [
    '对话框使用 XDSDialog——原生 <dialog> 配合 showModal() 实现正确的模态 ARIA 语义。',
    '输入框渲染为搜索输入，具有 combobox 角色、aria-expanded 和指向列表的 aria-controls。',
    '列表渲染为 role="listbox"，带有 aria-label。',
    '条目渲染为 role="option"，带有 aria-selected。',
    '键盘导航使用 XDSSelector 的 useCombobox，确保方向键、Home/End、Enter 和 Escape 行为一致。',
    '输入框中的加载指示器使用 role="status" 向屏幕阅读器播报加载状态。',
  ],
  keyboard:
    '上下方向键：导航条目；Enter：选择高亮条目；Escape：关闭面板；Tab：移动焦点到页脚操作',
  notes: [
    '使用 XDSSearchSource 接口——与 XDSTypeahead 相同。任何与 XDSTypeahead 兼容的源都可以在此使用。',
    'createStaticSource 除子字符串匹配外还支持关键词匹配。',
    '自动分组读取每个条目的 auxiliaryData.group——无需额外配置。',
    '选择器模式（value/onValueChange）保持面板打开并跟踪持久选择。',
    '来自 searchSource 的 isBusy 信号自动驱动 XDSCommandPaletteInput 中的加载指示器。',
  ],
  components: [
    {
      name: 'XDSCommandPalette',
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
      },
    },
    {
      name: 'XDSCommandPaletteInput',
      description: '搜索输入插槽。挂载时自动聚焦。在 XDSCommandPalette 内使用时连接到上下文。',
      propDescriptions: {
        placeholder: '输入框的占位文本。',
        hasAutoFocus: '挂载时自动聚焦输入框。',
        endContent: '渲染在输入框末尾的内容，位于加载指示器之后。',
        value: '搜索值。在 XDSCommandPalette 内省略时从上下文读取。',
        onValueChange: '搜索值变化时调用。在 XDSCommandPalette 内省略时写入上下文。',
        xstyle: 'StyleX 布局自定义样式。必须是 stylex.create() 的值。',
      },
    },
    {
      name: 'XDSCommandPaletteList',
      description: '可滚动的结果容器。作为 listbox 渲染以符合 ARIA 规范。',
      propDescriptions: {
        children: '条目、分组和空状态。',
        label: 'listbox 的无障碍标签。',
        xstyle: 'StyleX 布局自定义样式。必须是 stylex.create() 的值。',
      },
    },
    {
      name: 'XDSCommandPaletteItem',
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
      description: '带标题标签的视觉分组。放置在 XDSCommandPaletteList 内。',
      propDescriptions: {
        heading: '分组标题文本。',
        children: 'XDSCommandPaletteItem 子元素。',
        xstyle: 'StyleX 布局自定义样式。必须是 stylex.create() 的值。',
      },
    },
    {
      name: 'XDSCommandPaletteFooter',
      description: '显示键盘导航提示的页脚。未提供子元素时渲染默认方向键/Enter/Escape 提示。',
      propDescriptions: {
        children: '自定义页脚内容。省略时通过 XDSKbd 渲染默认键盘提示。',
        xstyle: 'StyleX 布局自定义样式。必须是 stylex.create() 的值。',
      },
    },
    {
      name: 'XDSCommandPaletteEmpty',
      description: '结果区域的空状态展示。由 XDSCommandPalette 在无结果和无查询状态下自动渲染。',
      propDescriptions: {
        children: '要显示的消息或内容。',
      },
    },
  ],
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'searchSource-driven command palette dialog; filtering, keyboard nav, grouping, selection; same XDSSearchSource interface as XDSTypeahead',
  features: [
    'searchSource: same interface as XDSTypeahead — static/async/hybrid',
    'auto-grouping: auxiliaryData.group auto-groups items',
    'createStaticSource: util for static lists w/ keyword matching',
    'async: spinner in input while search resolves',
    'keyboard: arrow keys, Enter=select, Escape=close',
    'picker mode: value/onValueChange for persistent selection',
    'composable: Input, List, Group, Item, Footer, Empty sub-components',
    'renderItem: custom per-item render w/ auto-grouping preserved',
  ],
  accessibility: [
    'dialog uses XDSDialog native <dialog> w/ showModal() for modal ARIA semantics',
    'input: combobox role, aria-expanded, aria-controls to list',
    'list: role="listbox" w/ aria-label',
    'items: role="option" w/ aria-selected',
    'keyboard nav via useCombobox from XDSSelector',
    'spinner: role="status" announces loading',
  ],
  keyboard: 'Arrow Up/Down=navigate; Enter=select; Escape=close; Tab=footer actions',
  notes: [
    'XDSSearchSource interface — same as XDSTypeahead; any compatible source works',
    'createStaticSource: keyword matching + substring matching',
    'auto-grouping reads auxiliaryData.group — no extra config',
    'picker mode keeps palette open, tracks persistent selection',
    'isBusy from searchSource drives spinner automatically',
  ],
  components: [
    {
      name: 'XDSCommandPalette',
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
      },
    },
    {
      name: 'XDSCommandPaletteInput',
      description: 'search input; auto-focus on mount; wires to context inside XDSCommandPalette',
      propDescriptions: {
        placeholder: 'input placeholder text',
        hasAutoFocus: 'auto-focus on mount',
        endContent: 'trailing content after spinner',
        value: 'search value; reads context when omitted inside palette',
        onValueChange: 'called on change; writes context when omitted inside palette',
        xstyle: 'StyleX layout styles; must be stylex.create() value',
      },
    },
    {
      name: 'XDSCommandPaletteList',
      description: 'scrollable results container; role=listbox',
      propDescriptions: {
        children: 'items, groups, empty states',
        label: 'a11y label for listbox',
        xstyle: 'StyleX layout styles; must be stylex.create() value',
      },
    },
    {
      name: 'XDSCommandPaletteItem',
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
      description: 'group w/ heading label; inside XDSCommandPaletteList',
      propDescriptions: {
        heading: 'group heading text',
        children: 'XDSCommandPaletteItem children',
        xstyle: 'StyleX layout styles; must be stylex.create() value',
      },
    },
    {
      name: 'XDSCommandPaletteFooter',
      description: 'footer w/ kbd hints; default=arrow/Enter/Escape hints via XDSKbd',
      propDescriptions: {
        children: 'custom content; default renders kbd hints',
        xstyle: 'StyleX layout styles; must be stylex.create() value',
      },
    },
    {
      name: 'XDSCommandPaletteEmpty',
      description: 'empty state; auto-rendered by palette for no-results+no-query states',
      propDescriptions: {
        children: 'message or content to display',
      },
    },
  ],
};
