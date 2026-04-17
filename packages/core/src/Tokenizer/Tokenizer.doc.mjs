/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Tokenizer',
  keywords: ["tokenizer","multiselect","multi-select","chips","tags","combobox","autocomplete","taginput","chipinput"],
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
        "Called when selection changes. The change argument includes the affected item and type ('add' | 'create' | 'remove' | 'reorder').",
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
      name: 'hasCreate',
      type: 'boolean',
      description:
        "Allow users to create new tokens from free-text input. When true, a \"Create\" option appears in the dropdown for typed text that doesn't match existing results. The onChange change type is 'create' for these items.",
      default: 'false',
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
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value — not an inline style object like style={{}}.',
    },
  ],
  theming: {
    targets: [
      {className: 'xds-tokenizer', visualProps: ['size']},
    ],
  },
  usage: {
    description:
      'Tokenizer is a multi-select input that lets users search and select multiple items displayed as removable token chips. Use Tokenizer when users need to build a set of selections from a searchable data source, such as adding recipients or applying multiple filters.',
    bestPractices: [
      {guidance: true, description: 'Provide a clear placeholder that communicates what users can search for.'},
      {guidance: true, description: 'Set a maxEntries limit when the number of selections should be bounded.'},
      {guidance: false, description: 'Avoid applying colored backgrounds to tokens within a Tokenizer — use the default color for consistency.'},
      {guidance: false, description: 'Avoid using Tokenizer for single-item selection — use Typeahead instead.'},
    ],
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Tokenizer',
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
        "选择变更时调用。change 参数包含受影响的项目和类型（'add' | 'create' | 'remove' | 'reorder'）。",
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
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局自定义的 StyleX 样式（外边距、定位、尺寸）。必须是 stylex.create() 的值 — 不能是内联样式对象如 style={{}}。',
    },
  ],
  theming: {
    targets: [
      {className: 'xds-tokenizer', visualProps: ['size']},
    ],
  },
  usage: {
    description:
      'Tokenizer is a multi-select input that lets users search and select multiple items displayed as removable token chips. Use Tokenizer when users need to build a set of selections from a searchable data source, such as adding recipients or applying multiple filters.',
    bestPractices: [
      {guidance: true, description: 'Provide a clear placeholder that communicates what users can search for.'},
      {guidance: true, description: 'Set a maxEntries limit when the number of selections should be bounded.'},
      {guidance: false, description: 'Avoid applying colored backgrounds to tokens within a Tokenizer — use the default color for consistency.'},
      {guidance: false, description: 'Avoid using Tokenizer for single-item selection — use Typeahead instead.'},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'Multi-select typeahead w/ token chips for selected items. Composes XDSBaseTypeahead for search+XDSToken for chips.',
  usage: {
    description:
      'Tokenizer is a multi-select input that lets users search and select multiple items displayed as removable token chips. Use Tokenizer when users need to build a set of selections from a searchable data source, such as adding recipients or applying multiple filters.',
    bestPractices: [
      {guidance: true, description: 'Provide a clear placeholder that communicates what users can search for.'},
      {guidance: true, description: 'Set a maxEntries limit when the number of selections should be bounded.'},
      {guidance: false, description: 'Avoid applying colored backgrounds to tokens within a Tokenizer — use the default color for consistency.'},
      {guidance: false, description: 'Avoid using Tokenizer for single-item selection — use Typeahead instead.'},
    ],
  },
  propDescriptions: {
    label: 'Accessible label for input.',
    searchSource: 'Data source w/ search+bootstrap methods for populating dropdown.',
    value: 'Array of currently selected items.',
    onChange: "Fired on selection change. Change arg includes affected item+type ('add'|'create'|'remove'|'reorder').",
    hasCreate: 'Enable free-text token creation. Shows "Create" dropdown option for unmatched typed text.',
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
    endContent: 'Content at input row end. For buttons, counts, controls.',
    xstyle: 'StyleX layout styles (margins, positioning). Must be stylex.create() value.',
  },
};
