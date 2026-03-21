/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Tokenizer',
  description:
    'Multi-select typeahead with token chips for selected items. Composes XDSBaseTypeahead for search and XDSToken for chips.',
  props: [
    {
      name: 'label',
      type: 'string',
      description: 'Accessible label for the input.',
      required: true,
    },
    {
      name: 'searchSource',
      type: 'XDSSearchSource<T>',
      description:
        'Data source providing search and bootstrap methods for populating the dropdown.',
      required: true,
    },
    {
      name: 'value',
      type: 'T[]',
      description: 'Array of currently selected items.',
      required: true,
    },
    {
      name: 'onChange',
      type: '(items: T[], change: XDSTokenizerChange<T>) => void',
      description:
        "Called when selection changes. The change argument includes the affected item and type ('add' | 'remove').",
      required: true,
    },
    {
      name: 'placeholder',
      type: 'string',
      description:
        'Input placeholder text. Only shown when no tokens are selected.',
    },
    {
      name: 'maxEntries',
      type: 'number',
      description:
        'Maximum number of selections allowed. Input is hidden when the limit is reached.',
    },
    {
      name: 'hasClear',
      type: 'boolean',
      description: 'Show a clear-all button for bulk removal of all tokens.',
      default: 'false',
    },
    {
      name: 'renderToken',
      type: '(item: T, onRemove: () => void) => ReactNode',
      description:
        'Custom render function for selected tokens. Default renders XDSToken with label and onRemove.',
    },
    {
      name: 'renderItem',
      type: '(item: T) => ReactNode',
      description:
        'Custom render function for dropdown items. Default renders XDSTypeaheadItem.',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: 'Disables the input and all token interactions.',
      default: 'false',
    },
    {
      name: 'status',
      type: 'XDSInputStatus',
      description:
        'Validation status object with type and message for error/warning/success states.',
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description: 'Visually hides the label while keeping it accessible.',
      default: 'false',
    },
    {
      name: 'description',
      type: 'string',
      description: 'Helper text displayed below the label.',
    },
    {
      name: 'isRequired',
      type: 'boolean',
      description: 'Marks the field as required.',
      default: 'false',
    },
    {
      name: 'isOptional',
      type: 'boolean',
      description: 'Shows an optional indicator on the label.',
      default: 'false',
    },
    {
      name: 'labelTooltip',
      type: 'string',
      description: 'Tooltip text shown on the label.',
    },
    {
      name: 'hasEntriesOnFocus',
      type: 'boolean',
      description: 'Show bootstrap results on focus before typing.',
      default: 'false',
    },
    {
      name: 'maxMenuItems',
      type: 'number',
      description: 'Maximum number of dropdown items to display.',
      default: '10',
    },
    {
      name: 'emptySearchResultsText',
      type: 'string',
      description: 'Text shown when search returns no results.',
      default: "'No results found'",
    },
    {
      name: 'hasAutoFocus',
      type: 'boolean',
      description: 'Auto-focus the input on mount.',
      default: 'false',
    },
    {
      name: 'size',
      type: "'sm' | 'md'",
      description: 'Input and token size.',
      default: "'md'",
    },
    {
      name: 'debounceMs',
      type: 'number',
      description:
        'Debounce delay in ms before triggering search. Set to 0 for synchronous sources.',
      default: '150',
    },
    {
      name: 'onChangeQuery',
      type: '(query: string) => void',
      description: 'Callback fired when the search query text changes.',
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description:
        'Content to display at the end of the input row. Useful for buttons, result counts, or other controls.',
    },
    {
      name: 'startIcon',
      type: 'XDSIconType',
      description:
        'Icon to display at the start of the input. Pass an SVG icon component.',
    },
  ],
  examples: [
    {
      label: 'Basic multi-select',
      code: `const source = {
  search: query => users.filter(u => u.label.includes(query)),
  bootstrap: () => users.slice(0, 5),
};

<XDSTokenizer
  label="Team Members"
  searchSource={source}
  value={selected}
  onChange={(items, change) => {
    setSelected(items);
  }}
  placeholder="Search people..."
/>`,
    },
    {
      label: 'With max entries and clear all',
      code: `<XDSTokenizer
  label="Tags"
  searchSource={tagSource}
  value={tags}
  onChange={(items) => setTags(items)}
  maxEntries={5}
  hasClear
  placeholder="Add up to 5 tags..."
/>`,
    },
    {
      label: 'Custom token rendering',
      code: `<XDSTokenizer
  label="Tags"
  searchSource={tagSource}
  value={tags}
  onChange={(items) => setTags(items)}
  renderToken={(item, onRemove) => (
    <XDSToken
      label={item.label}
      color={item.auxiliaryData.color}
      onRemove={onRemove}
    />
  )}
  maxEntries={10}
/>`,
    },
  ],
  features: [
    'Token chips for each selected item with remove buttons',
    'Filtered search that automatically excludes already-selected items',
    'Max entries to limit number of selections — input hides when limit is reached',
    'Clear all button for bulk removal',
    'Custom token and item rendering via renderToken and renderItem',
    'Backspace on empty input removes the last token',
    'Arrow key navigation between token remove buttons and input',
    'aria-live announcements for add/remove/clear actions',
    'aria-required and aria-invalid wired to input for form validation',
    'aria-hidden and tabIndex=-1 on input when at maxEntries',
    "Change metadata: onChange receives a second argument with type ('add' | 'remove')",
  ],
  accessibility: [
    'Wrapped in XDSField for label, description, and status message association.',
    'Token container has role="group" with aria-label.',
    'Clear all button has aria-label="Clear all".',
    'Combobox pattern provided by XDSBaseTypeahead with aria-expanded and aria-autocomplete.',
    'aria-required set on combobox when isRequired is true.',
    'aria-invalid set on combobox when status type is error.',
    'aria-hidden and tabIndex=-1 on input when at maxEntries to remove from tab order.',
    'aria-live="polite" region announces add/remove/clear actions to screen readers.',
  ],
  keyboard:
    'Backspace on empty input removes last token; ArrowLeft from empty input focuses last token remove button; ArrowLeft/ArrowRight navigate between token remove buttons; ArrowRight from last token returns focus to input; Arrow keys navigate dropdown; Enter selects highlighted item; Escape closes dropdown',
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Tokenizer',
  description:
    '带有标记芯片的多选预输入组件，用于显示已选项目。组合使用 XDSBaseTypeahead 进行搜索和 XDSToken 显示芯片。',
  props: [
    {
      name: 'label',
      type: 'string',
      description: '输入框的无障碍标签。',
      required: true,
    },
    {
      name: 'searchSource',
      type: 'XDSSearchSource<T>',
      description:
        '提供搜索和引导方法的数据源，用于填充下拉列表。',
      required: true,
    },
    {
      name: 'value',
      type: 'T[]',
      description: '当前已选项目的数组。',
      required: true,
    },
    {
      name: 'onChange',
      type: '(items: T[], change: XDSTokenizerChange<T>) => void',
      description:
        "选择变更时调用。change 参数包含受影响的项目和类型（'add' | 'remove'）。",
      required: true,
    },
    {
      name: 'placeholder',
      type: 'string',
      description:
        '输入框占位文本。仅在未选择任何标记时显示。',
    },
    {
      name: 'maxEntries',
      type: 'number',
      description:
        '允许的最大选择数量。达到限制时输入框会隐藏。',
    },
    {
      name: 'hasClear',
      type: 'boolean',
      description: '显示全部清除按钮，用于批量移除所有标记。',
      default: 'false',
    },
    {
      name: 'renderToken',
      type: '(item: T, onRemove: () => void) => ReactNode',
      description:
        '已选标记的自定义渲染函数。默认渲染带有 label 和 onRemove 的 XDSToken。',
    },
    {
      name: 'renderItem',
      type: '(item: T) => ReactNode',
      description:
        '下拉列表项的自定义渲染函数。默认渲染 XDSTypeaheadItem。',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '禁用输入框和所有标记交互。',
      default: 'false',
    },
    {
      name: 'status',
      type: 'XDSInputStatus',
      description:
        '验证状态对象，包含类型和消息，用于错误/警告/成功状态。',
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description: '视觉隐藏标签，同时保持其可访问性。',
      default: 'false',
    },
    {
      name: 'description',
      type: 'string',
      description: '显示在标签下方的辅助文本。',
    },
    {
      name: 'isRequired',
      type: 'boolean',
      description: '将字段标记为必填。',
      default: 'false',
    },
    {
      name: 'isOptional',
      type: 'boolean',
      description: '在标签上显示可选指示器。',
      default: 'false',
    },
    {
      name: 'labelTooltip',
      type: 'string',
      description: '标签上显示的工具提示文本。',
    },
    {
      name: 'hasEntriesOnFocus',
      type: 'boolean',
      description: '聚焦时在输入前显示引导结果。',
      default: 'false',
    },
    {
      name: 'maxMenuItems',
      type: 'number',
      description: '下拉列表显示的最大项目数。',
      default: '10',
    },
    {
      name: 'emptySearchResultsText',
      type: 'string',
      description: '搜索无结果时显示的文本。',
      default: "'No results found'",
    },
    {
      name: 'hasAutoFocus',
      type: 'boolean',
      description: '挂载时自动聚焦输入框。',
      default: 'false',
    },
    {
      name: 'size',
      type: "'sm' | 'md'",
      description: '输入框和标记的尺寸。',
      default: "'md'",
    },
    {
      name: 'debounceMs',
      type: 'number',
      description:
        '触发搜索前的防抖延迟（毫秒）。同步数据源设置为 0。',
      default: '150',
    },
    {
      name: 'onChangeQuery',
      type: '(query: string) => void',
      description: '搜索查询文本变更时触发的回调。',
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description:
        '在输入行末尾显示的内容。适用于按钮、结果计数或其他控件。',
    },
    {
      name: 'startIcon',
      type: 'XDSIconType',
      description: '在输入框开头显示的图标。传入 SVG 图标组件。',
    },
  ],
  examples: [
    {
      label: '基础多选',
      code: `const source = {
  search: query => users.filter(u => u.label.includes(query)),
  bootstrap: () => users.slice(0, 5),
};

<XDSTokenizer
  label="Team Members"
  searchSource={source}
  value={selected}
  onChange={(items, change) => {
    setSelected(items);
  }}
  placeholder="Search people..."
/>`,
    },
    {
      label: '带最大条目数和全部清除',
      code: `<XDSTokenizer
  label="Tags"
  searchSource={tagSource}
  value={tags}
  onChange={(items) => setTags(items)}
  maxEntries={5}
  hasClear
  placeholder="Add up to 5 tags..."
/>`,
    },
    {
      label: '自定义标记渲染',
      code: `<XDSTokenizer
  label="Tags"
  searchSource={tagSource}
  value={tags}
  onChange={(items) => setTags(items)}
  renderToken={(item, onRemove) => (
    <XDSToken
      label={item.label}
      color={item.auxiliaryData.color}
      onRemove={onRemove}
    />
  )}
  maxEntries={10}
/>`,
    },
  ],
  features: [
    '每个已选项目显示带移除按钮的标记芯片',
    '过滤搜索自动排除已选项目',
    '最大条目数限制选择数量 — 达到限制时输入框隐藏',
    '全部清除按钮用于批量移除',
    '通过 renderToken 和 renderItem 自定义标记和项目渲染',
    '在空输入框上按退格键移除最后一个标记',
    '方向键在标记移除按钮和输入框之间导航',
    'aria-live 通知添加/移除/清除操作',
    'aria-required 和 aria-invalid 连接到输入框用于表单验证',
    '达到 maxEntries 时输入框设置 aria-hidden 和 tabIndex=-1',
    "变更元数据：onChange 接收第二个参数，包含类型（'add' | 'remove'）",
  ],
  accessibility: [
    '包裹在 XDSField 中，用于标签、描述和状态消息的关联。',
    '标记容器具有 role="group" 和 aria-label。',
    '全部清除按钮具有 aria-label="Clear all"。',
    'XDSBaseTypeahead 提供组合框模式，包含 aria-expanded 和 aria-autocomplete。',
    '当 isRequired 为 true 时，在组合框上设置 aria-required。',
    '当状态类型为 error 时，在组合框上设置 aria-invalid。',
    '达到 maxEntries 时，输入框设置 aria-hidden 和 tabIndex=-1，从 Tab 顺序中移除。',
    'aria-live="polite" 区域向屏幕阅读器通知添加/移除/清除操作。',
  ],
  keyboard:
    '在空输入框上按退格键移除最后一个标记；从空输入框按左箭头聚焦最后一个标记移除按钮；左右箭头在标记移除按钮之间导航；从最后一个标记按右箭头返回输入框；方向键导航下拉列表；Enter 选择高亮项目；Escape 关闭下拉列表',
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'Multi-select typeahead w/ token chips for selected items. Composes XDSBaseTypeahead for search+XDSToken for chips.',
  features: [
    'Token chips for each selected item w/ remove buttons',
    'Filtered search auto-excludes already-selected items',
    'Max entries limits selections; input hides at limit',
    'Clear all button for bulk removal',
    'Custom token+item rendering via renderToken+renderItem',
    'Backspace on empty input removes last token',
    'Arrow key navigation between token remove buttons+input',
    'aria-live announcements for add/remove/clear actions',
    'aria-required+aria-invalid wired for form validation',
    'aria-hidden+tabIndex=-1 on input at maxEntries',
    "Change metadata: onChange receives second arg w/ type ('add'|'remove')",
  ],
  accessibility: [
    'Wrapped in XDSField for label, description, status message association.',
    'Token container has role="group" w/ aria-label.',
    'Clear all button has aria-label="Clear all".',
    'Combobox pattern via XDSBaseTypeahead w/ aria-expanded+aria-autocomplete.',
    'aria-required on combobox when isRequired.',
    'aria-invalid on combobox when status=error.',
    'aria-hidden+tabIndex=-1 on input at maxEntries.',
    'aria-live="polite" announces add/remove/clear to screen readers.',
  ],
  keyboard: 'Backspace on empty input removes last token. ArrowLeft from empty input focuses last token remove button. ArrowLeft/ArrowRight navigate between tokens. ArrowRight from last token returns to input. Arrow keys navigate dropdown. Enter selects highlighted item. Escape closes dropdown.',
  propDescriptions: {
    label: 'Accessible label for input.',
    searchSource: 'Data source w/ search+bootstrap methods for populating dropdown.',
    value: 'Array of currently selected items.',
    onChange: "Fired on selection change. Change arg includes affected item+type ('add'|'remove').",
    placeholder: 'Input placeholder. Only shown when no tokens selected.',
    maxEntries: 'Max selections allowed. Input hidden at limit.',
    hasClear: 'Clear-all button for bulk removal.',
    renderToken: 'Custom token render. Default renders XDSToken w/ label+onRemove.',
    renderItem: 'Custom dropdown item render. Default renders XDSTypeaheadItem.',
    isDisabled: 'Disables input+all token interactions.',
    status: 'Validation status w/ type+message for error/warning/success.',
    isLabelHidden: 'Visually hides label; keeps a11y.',
    description: 'Helper text below label.',
    isRequired: 'Marks field required.',
    isOptional: 'Shows optional indicator on label.',
    labelTooltip: 'Tooltip on label.',
    hasEntriesOnFocus: 'Show bootstrap results on focus before typing.',
    maxMenuItems: 'Max dropdown items to display.',
    emptySearchResultsText: 'Text when search returns no results.',
    hasAutoFocus: 'Auto-focus input on mount.',
    size: 'Input+token size.',
    debounceMs: 'Search debounce delay ms. 0 for sync sources.',
    onChangeQuery: 'Fired on search query text change.',
    startIcon: 'Icon at input start. Pass SVG icon component.',
    endContent: 'Content at input row end. For buttons, counts, controls.',
    xstyle: 'StyleX layout styles (margins, positioning). Must be stylex.create() value.',
  },
};
