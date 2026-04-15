/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'PowerSearch',
  description:
    'Structured filter bar where each token represents a filter (field + operator + value). Users select fields from a typeahead dropdown, configure operators and values in an edit popover, and manage filters as removable tokens.',
  showcase: {
    aspectRatio: 4 / 3,
    code: '<XDSPowerSearch config={{name: "search", fields: []}} />',
  },
  keywords: ["powersearch","search","searchbar","filter","filterbar","faceted","querybuilder","structured","omnibar"],
  props: [
    {
      name: 'config',
      type: 'PowerSearchConfig',
      description:
        'Configuration defining available fields, operators, and their value types.',
      required: true,
    },
    {
      name: 'filters',
      type: 'ReadonlyArray<PowerSearchFilter>',
      description: 'Currently active filters.',
      required: true,
    },
    {
      name: 'onChange',
      type: '(filters: ReadonlyArray<PowerSearchFilter>, changeType: PowerSearchChangeType, index: number) => void',
      description:
        "Called when filters change. changeType is 'add', 'edit', or 'remove'. index is the affected filter's position.",
      required: true,
    },
    {
      name: 'label',
      type: 'string',
      description: 'Accessible label for the search input.',
      default: "'Search'",
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description: 'Visually hides the label while keeping it accessible.',
      default: 'true',
    },
    {
      name: 'placeholder',
      type: 'string',
      description:
        'Placeholder text shown when no filters are selected.',
      default: "'Search...'",
    },
    {
      name: 'hasAutoFocus',
      type: 'boolean',
      description: 'Auto-focus the input on mount.',
      default: 'false',
    },
    {
      name: 'hasClear',
      type: 'boolean',
      description: 'Show a clear-all button for removing all filters.',
      default: 'true',
    },
    {
      name: 'isReadOnly',
      type: 'boolean',
      description: 'Prevent adding, editing, or removing filters.',
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: 'Disables the entire component.',
      default: 'false',
    },
    {
      name: 'status',
      type: 'XDSInputStatus',
      description:
        'Validation status object with type and optional message.',
    },
    {
      name: 'maxTokenLength',
      type: 'number',
      description: 'Max character length for filter value display in tokens.',
      default: '40',
    },
    {
      name: 'popoverSaveButtonLabel',
      type: 'string',
      description: 'Label for the save button in the edit popover.',
      default: "'Apply'",
    },
    {
      name: 'timezoneID',
      type: 'string',
      description: 'Timezone ID for date formatting (e.g. "America/New_York").',
    },
    {
      name: 'ref',
      type: 'Ref<XDSPowerSearchHandle>',
      description:
        'Imperative handle with focusTypeahead() and blurTypeahead() methods.',
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description:
        'Content to display at the end of the input row. Useful for action buttons or other controls.',
    },
    {
      name: 'resultCount',
      type: 'number | string',
      description:
        'Number of results matching the current filters. When a number, formatted as "N results". When a string, displayed as-is.',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for layout customization. Must be a stylex.create() value.',
    },
  ],
  features: [
    'Typeahead field selection with search and aliases',
    'Edit popover with field, operator, and value selectors',
    'Support for 13 value types: string, integer, float, enum, date, time, and more',
    'Token-based display with click-to-edit and remove',
    'Imperative API for focus/blur control via ref',
    'Read-only mode for displaying filters without editing',
  ],
  accessibility: [
    'Built on XDSTokenizer which provides combobox pattern with aria-expanded and aria-autocomplete.',
    'Filter tokens have accessible labels with field name, operator, and value.',
    'Edit popover uses XDSPopover with focus trapping and light dismiss.',
    'Clear all button has accessible label.',
  ],
  keyboard:
    'Type to search fields; Enter to select; Click token to edit; Backspace on empty input removes last filter; Escape closes popover',
  usage: {
    summary: 'Structured filter bar where each token represents a filter with field, operator, and value.',
    content: `## When to use

- Complex filtering across multiple dimensions.
- Users need to build and combine filter criteria.

## When NOT to use

- Simple single-field search (use a text input instead).`,
  },
};

// -------------------------------------------------------
// Auto-generated translations below. Do not edit manually.
// Regenerate with the dense compression protocol.
// See .context/decisions/dense-compression-protocol.md
// -------------------------------------------------------

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'PowerSearch',
  description:
    '结构化过滤栏，每个令牌代表一个过滤器（字段 + 运算符 + 值）。用户从预输入下拉菜单中选择字段，在编辑弹出窗口中配置运算符和值，并将过滤器作为可移除的令牌进行管理。',
  props: [
    {
      name: 'config',
      type: 'PowerSearchConfig',
      description: '定义可用字段、运算符及其值类型的配置。',
      required: true,
    },
    {
      name: 'filters',
      type: 'ReadonlyArray<PowerSearchFilter>',
      description: '当前活跃的过滤器。',
      required: true,
    },
    {
      name: 'onChange',
      type: '(filters: ReadonlyArray<PowerSearchFilter>, changeType: PowerSearchChangeType, index: number) => void',
      description:
        "当过滤器变更时调用。changeType 为 'add'、'edit' 或 'remove'。index 为受影响的过滤器位置。",
      required: true,
    },
    {
      name: 'label',
      type: 'string',
      description: '搜索输入框的无障碍标签。',
      default: "'Search'",
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description: '视觉上隐藏标签，同时保持无障碍性。',
      default: 'true',
    },
    {
      name: 'placeholder',
      type: 'string',
      description: '未选择过滤器时显示的占位文本。',
      default: "'Search...'",
    },
    {
      name: 'hasAutoFocus',
      type: 'boolean',
      description: '挂载时自动聚焦输入框。',
      default: 'false',
    },
    {
      name: 'hasClear',
      type: 'boolean',
      description: '显示清除全部按钮以移除所有过滤器。',
      default: 'true',
    },
    {
      name: 'isReadOnly',
      type: 'boolean',
      description: '阻止添加、编辑或移除过滤器。',
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '禁用整个组件。',
      default: 'false',
    },
    {
      name: 'status',
      type: 'XDSInputStatus',
      description: '带有类型和可选消息的验证状态对象。',
    },
    {
      name: 'maxTokenLength',
      type: 'number',
      description: '令牌中过滤器值显示的最大字符长度。',
      default: '40',
    },
    {
      name: 'popoverSaveButtonLabel',
      type: 'string',
      description: '编辑弹出窗口中保存按钮的标签。',
      default: "'Apply'",
    },
    {
      name: 'timezoneID',
      type: 'string',
      description: '用于日期格式化的时区 ID（例如 "America/New_York"）。',
    },
    {
      name: 'ref',
      type: 'Ref<XDSPowerSearchHandle>',
      description: '提供 focusTypeahead() 和 blurTypeahead() 方法的命令式句柄。',
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description: '显示在输入行末尾的内容。适用于操作按钮或其他控件。',
    },
    {
      name: 'resultCount',
      type: 'number | string',
      description:
        '匹配当前过滤器的结果数量。数字类型时格式化为"N results"。字符串类型时按原样显示。',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: '用于布局自定义的 StyleX 样式。必须是 stylex.create() 值。',
    },
  ],
  features: [
    '预输入字段选择，支持搜索和别名',
    '编辑弹出窗口，包含字段、运算符和值选择器',
    '支持 13 种值类型：字符串、整数、浮点数、枚举、日期、时间等',
    '令牌式显示，支持点击编辑和移除',
    '通过 ref 提供命令式 API 控制聚焦/失焦',
    '只读模式，显示过滤器但不允许编辑',
  ],
  accessibility: [
    '基于 XDSTokenizer 构建，提供 combobox 模式，包含 aria-expanded 和 aria-autocomplete。',
    '过滤器令牌具有包含字段名、运算符和值的无障碍标签。',
    '编辑弹出窗口使用 XDSPopover，支持焦点捕获和轻量关闭。',
    '清除全部按钮具有无障碍标签。',
  ],
  keyboard:
    '输入搜索字段；回车选择；点击令牌编辑；空输入时退格删除最后一个过滤器；Escape 关闭弹出窗口',
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'Structured filter bar where each token represents filter (field+operator+value). Users select fields from typeahead dropdown, configure operators+values in edit popover, manage filters as removable tokens.',
  features: [
    'Typeahead field selection w/ search + aliases',
    'Edit popover w/ field, operator, value selectors',
    'Support for 13 value types: string, integer, float, enum, date, time, more',
    'Token-based display w/ click-to-edit + remove',
    'Imperative API for focus/blur control via ref',
    'Read-only mode for displaying filters w/o editing',
  ],
  accessibility: [
    'Built on XDSTokenizer providing combobox pattern w/ aria-expanded + aria-autocomplete.',
    'Filter tokens have accessible labels w/ field name, operator, value.',
    'Edit popover uses XDSPopover w/ focus trapping + light dismiss.',
    'Clear all button has accessible label.',
  ],
  keyboard:
    'Type to search fields; Enter to select; Click token to edit; Backspace on empty input removes last filter; Escape closes popover',
  propDescriptions: {
    config: 'Configuration defining available fields, operators, value types.',
    filters: 'Currently active filters.',
    onChange: "Called on filter change. changeType is 'add', 'edit', or 'remove'. index is affected filter position.",
    label: 'Accessible label for search input.',
    isLabelHidden: 'Visually hides label while keeping accessible.',
    placeholder: 'Text shown when no filters selected.',
    hasAutoFocus: 'Auto-focus input on mount.',
    hasClear: 'Show clear-all button for removing all filters.',
    isReadOnly: 'Prevent adding, editing, or removing filters.',
    isDisabled: 'Disables entire component.',
    status: 'Validation status object w/ type + optional message.',
    maxTokenLength: 'Max char length for filter value display in tokens.',
    popoverSaveButtonLabel: 'Label for save button in edit popover.',
    timezoneID: 'Timezone ID for date formatting (e.g. "America/New_York").',
    ref: 'Imperative handle w/ focusTypeahead() + blurTypeahead() methods.',
    endContent: 'Content at end of input row. Useful for action buttons or controls.',
    resultCount: 'Result count matching current filters. Number formatted as "N results"; string displayed as-is.',
    xstyle: 'StyleX styles for layout customization. Must be stylex.create() value.',
  },
};
