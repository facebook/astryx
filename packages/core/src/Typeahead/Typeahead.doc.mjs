// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Typeahead',
  displayName: 'Typeahead',
  group: 'Typeahead',
  category: 'Inputs',
  keywords: ["typeahead","autocomplete","combobox","searchbox","autosuggest","select","dropdown","lookup","searchable","suggestion","picker"],
  components: [
    {
      name: 'XDSTypeahead',
      displayName: 'Typeahead',
      description:
        'Styled typeahead with label, description, validation, and all field features. Wraps XDSBaseTypeahead with XDSField for the primary use case.',
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
          type: 'T | null',
          description:
            'Currently selected item, or null if nothing is selected.',
          required: true,
        },
        {
          name: 'onChange',
          type: '(item: T | null) => void',
          description: 'Called when the selection changes.',
          required: true,
        },
        {
          name: 'placeholder',
          type: 'string',
          description: 'Input placeholder text.',
        },
        {
          name: 'hasEntriesOnFocus',
          type: 'boolean',
          description: 'Show bootstrap results on focus before typing.',
          default: 'false',
        },
        {
          name: 'hasClear',
          type: 'boolean',
          description: 'Show clear button to deselect the current value.',
          default: 'true',
        },
        {
          name: 'isDisabled',
          type: 'boolean',
          description: 'Disables the input.',
          default: 'false',
        },
        {
          name: 'maxMenuItems',
          type: 'number',
          description: 'Maximum number of dropdown items to display.',
          default: '10',
        },
        {
          name: 'status',
          type: 'XDSInputStatus',
          description:
            'Validation status object with type and message for error/warning/success states.',
        },
        {
          name: 'renderItem',
          type: '(item: T) => ReactNode',
          description:
            'Custom render function for dropdown items. Default renders XDSTypeaheadItem.',
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
          type: "'sm' | 'md' | 'lg'",
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
          name: 'onOpenChange',
          type: '(isOpen: boolean) => void',
          description: 'Callback when the dropdown opens or closes.',
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value — not an inline style object like style={{}}.',
        },
      ],    },
    {
      name: 'XDSBaseTypeahead',
      displayName: 'Base Typeahead',
      description:
        'Unstyled combobox engine providing input, search, keyboard navigation, and dropdown. No wrapper div, no border styling, no token rendering. Used by XDSTypeahead and XDSTokenizer for custom compositions.',
      props: [
        {
          name: 'searchSource',
          type: 'XDSSearchSource<T>',
          description: 'Data source providing search and bootstrap methods.',
          required: true,
        },
        {
          name: 'value',
          type: 'T | null',
          description: 'Currently selected item.',
          required: true,
        },
        {
          name: 'onChange',
          type: '(item: T | null) => void',
          description: 'Called when the selection changes.',
          required: true,
        },
        {
          name: 'renderItem',
          type: '(item: T) => ReactNode',
          description: 'Custom render function for dropdown items.',
        },
        {
          name: 'placeholder',
          type: 'string',
          description: 'Input placeholder text.',
          default: "'Search...'",
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
          description: 'Maximum dropdown items to display.',
          default: '10',
        },
        {
          name: 'emptySearchResultsText',
          type: 'string',
          description: 'Text shown when search returns no results.',
          default: "'No results found'",
        },
        {
          name: 'isDisabled',
          type: 'boolean',
          description: 'Whether the input is disabled.',
          default: 'false',
        },
        {
          name: 'hasAutoFocus',
          type: 'boolean',
          description: 'Auto-focus the input on mount.',
          default: 'false',
        },
        {
          name: 'debounceMs',
          type: 'number',
          description:
            'Debounce delay in ms before triggering search. Set to 0 for synchronous sources.',
          default: '150',
        },
        {
          name: 'anchorRef',
          type: 'RefObject<HTMLElement | null>',
          description:
            'Ref to the anchor element for dropdown positioning. If not provided, the input itself is used.',
        },
        {
          name: 'inputXStyle',
          type: 'StyleXStyles',
          description: 'Additional StyleX styles for the input element.',
        },
        {
          name: 'onKeyDown',
          type: '(e: React.KeyboardEvent<HTMLInputElement>) => void',
          description:
            'Additional keydown handler called before internal keyboard navigation. Call e.preventDefault() to skip internal handling.',
        },
        {
          name: 'onChangeQuery',
          type: '(query: string) => void',
          description: 'Callback fired when the search query text changes.',
        },
        {
          name: 'onOpenChange',
          type: '(isOpen: boolean) => void',
          description: 'Callback when the dropdown opens or closes.',
        },
        {
          name: 'inputId',
          type: 'string',
          description: 'ID for the input element (for label association).',
        },
        {
          name: 'ariaDescribedBy',
          type: 'string',
          description: 'Additional aria-describedby IDs.',
        },
      ],
    },
    {
      name: 'XDSTypeaheadItem',
      displayName: 'Typeahead Item',
      description:
        'Default dropdown item renderer for typeahead results. Shows label with optional icon, description, and avatar. Exported for use in custom renderItem implementations.',
      props: [
        {
          name: 'item',
          type: 'XDSSearchableItem',
          description: 'The search result item to render.',
          required: true,
        },
        {
          name: 'icon',
          type: 'ReactNode',
          description: 'Icon or avatar to display before the label.',
          slotElements: [{__element: 'XDSIcon', props: {icon: 'check', size: 'sm'}}],
        },
        {
          name: 'description',
          type: 'string',
          description: 'Description text displayed below the label.',
        },
        {
          name: 'isDisabled',
          type: 'boolean',
          description: 'Whether this item is visually disabled.',
          default: 'false',
        },
        {
          name: 'group',
          type: 'string',
          description: 'Group label for grouping items visually.',
        },
      ],
    },
  ],
  theming: {
    targets: [
      {className: 'xds-typeahead', visualProps: ['status']},
      {className: 'xds-typeahead-dropdown'},
      {className: 'xds-typeahead-item'},
    ],
  },
  usage: {
    description:
      'A searchable input for selecting a single item from a large or dynamic dataset. Results appear as the user types, with support for async data sources, debounced search, and custom item rendering. Use it when the option list is too large for a Selector dropdown.',
    bestPractices: [
      {guidance: true, description: 'Provide descriptive placeholder text that hints at what users can search for.'},
      {guidance: true, description: 'Show suggestions on focus when users benefit from seeing popular or recent options before typing.'},
      {guidance: true, description: 'Add a search delay for remote data sources to avoid excessive network requests.'},
      {guidance: false, description: 'Use for short, static option lists — use Selector for better discoverability.'},
      {guidance: false, description: 'Use for multi-selection — use Tokenizer instead.'},
      {guidance: false, description: 'Place multiple Typeaheads adjacent to each other without clear labels differentiating them.'},
    ],
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Typeahead',
  displayName: 'Typeahead',
  components: [
    {
      name: 'XDSTypeahead',
      displayName: 'Typeahead',
      description:
        '带有标签、描述、验证和所有字段功能的样式化预输入组件。使用 XDSField 包裹 XDSBaseTypeahead，适用于主要用例。',
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
          type: 'T | null',
          description:
            '当前选中的项目，未选择时为 null。',
          required: true,
        },
        {
          name: 'onChange',
          type: '(item: T | null) => void',
          description: '选择变更时调用。',
          required: true,
        },
        {
          name: 'placeholder',
          type: 'string',
          description: '输入框占位文本。',
        },
        {
          name: 'hasEntriesOnFocus',
          type: 'boolean',
          description: '聚焦时在输入前显示引导结果。',
          default: 'false',
        },
        {
          name: 'hasClear',
          type: 'boolean',
          description: '显示清除按钮以取消选择当前值。',
          default: 'true',
        },
        {
          name: 'isDisabled',
          type: 'boolean',
          description: '禁用输入框。',
          default: 'false',
        },
        {
          name: 'maxMenuItems',
          type: 'number',
          description: '下拉列表显示的最大项目数。',
          default: '10',
        },
        {
          name: 'status',
          type: 'XDSInputStatus',
          description:
            '验证状态对象，包含类型和消息，用于错误/警告/成功状态。',
        },
        {
          name: 'renderItem',
          type: '(item: T) => ReactNode',
          description:
            '下拉列表项的自定义渲染函数。默认渲染 XDSTypeaheadItem。',
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
          type: "'sm' | 'md' | 'lg'",
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
          name: 'onOpenChange',
          type: '(isOpen: boolean) => void',
          description: '下拉列表打开或关闭时的回调。',
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            '用于布局自定义的 StyleX 样式（外边距、定位、尺寸）。必须是 stylex.create() 的值 — 不能是内联样式对象如 style={{}}。',
        },
      ],
    },
    {
      name: 'XDSBaseTypeahead',
      displayName: 'Base Typeahead',
      description:
        '无样式的组合框引擎，提供输入、搜索、键盘导航和下拉列表。无包装 div，无边框样式，无标记渲染。由 XDSTypeahead 和 XDSTokenizer 用于自定义组合。',
      props: [
        {
          name: 'searchSource',
          type: 'XDSSearchSource<T>',
          description: '提供搜索和引导方法的数据源。',
          required: true,
        },
        {
          name: 'value',
          type: 'T | null',
          description: '当前选中的项目。',
          required: true,
        },
        {
          name: 'onChange',
          type: '(item: T | null) => void',
          description: '选择变更时调用。',
          required: true,
        },
        {
          name: 'renderItem',
          type: '(item: T) => ReactNode',
          description: '下拉列表项的自定义渲染函数。',
        },
        {
          name: 'placeholder',
          type: 'string',
          description: '输入框占位文本。',
          default: "'Search...'",
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
          name: 'isDisabled',
          type: 'boolean',
          description: '输入框是否被禁用。',
          default: 'false',
        },
        {
          name: 'hasAutoFocus',
          type: 'boolean',
          description: '挂载时自动聚焦输入框。',
          default: 'false',
        },
        {
          name: 'debounceMs',
          type: 'number',
          description:
            '触发搜索前的防抖延迟（毫秒）。同步数据源设置为 0。',
          default: '150',
        },
        {
          name: 'anchorRef',
          type: 'RefObject<HTMLElement | null>',
          description:
            '用于下拉列表定位的锚点元素引用。未提供时使用输入框本身。',
        },
        {
          name: 'inputXStyle',
          type: 'StyleXStyles',
          description: '输入元素的附加 StyleX 样式。',
        },
        {
          name: 'onKeyDown',
          type: '(e: React.KeyboardEvent<HTMLInputElement>) => void',
          description:
            '在内部键盘导航之前调用的附加 keydown 处理函数。调用 e.preventDefault() 可跳过内部处理。',
        },
        {
          name: 'onChangeQuery',
          type: '(query: string) => void',
          description: '搜索查询文本变更时触发的回调。',
        },
        {
          name: 'onOpenChange',
          type: '(isOpen: boolean) => void',
          description: '下拉列表打开或关闭时的回调。',
        },
        {
          name: 'inputId',
          type: 'string',
          description: '输入元素的 ID（用于标签关联）。',
        },
        {
          name: 'ariaDescribedBy',
          type: 'string',
          description: '附加的 aria-describedby ID。',
        },
      ],
    },
    {
      name: 'XDSTypeaheadItem',
      displayName: 'Typeahead Item',
      description:
        '预输入结果的默认下拉项渲染器。显示标签以及可选的图标、描述和头像。导出供自定义 renderItem 实现使用。',
      props: [
        {
          name: 'item',
          type: 'XDSSearchableItem',
          description: '要渲染的搜索结果项。',
          required: true,
        },
        {
          name: 'icon',
          type: 'ReactNode',
          description: '在标签前显示的图标或头像。',
        },
        {
          name: 'description',
          type: 'string',
          description: '显示在标签下方的描述文本。',
        },
        {
          name: 'isDisabled',
          type: 'boolean',
          description: '此项是否在视觉上被禁用。',
          default: 'false',
        },
        {
          name: 'group',
          type: 'string',
          description: '用于视觉分组的分组标签。',
        },
      ],
    },
  ],
  theming: {
    targets: [
      {className: 'xds-typeahead', visualProps: ['status']},
      {className: 'xds-typeahead-dropdown'},
      {className: 'xds-typeahead-item'},
    ],
  },
  usage: {
    description:
      'A searchable input for selecting a single item from a large or dynamic dataset. Results appear as the user types, with support for async data sources, debounced search, and custom item rendering. Use it when the option list is too large for a Selector dropdown.',
    bestPractices: [
      {guidance: true, description: 'Provide descriptive placeholder text that hints at what users can search for.'},
      {guidance: true, description: 'Show suggestions on focus when users benefit from seeing popular or recent options before typing.'},
      {guidance: true, description: 'Add a search delay for remote data sources to avoid excessive network requests.'},
      {guidance: false, description: 'Use for short, static option lists — use Selector for better discoverability.'},
      {guidance: false, description: 'Use for multi-selection — use Tokenizer instead.'},
      {guidance: false, description: 'Place multiple Typeaheads adjacent to each other without clear labels differentiating them.'},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'Searchable dropdown for single-item selection w/ keyboard navigation. Supports async+sync search via searchSource interface.',
  usage: {
    description:
      'A searchable input for selecting a single item from a large or dynamic dataset. Results appear as the user types, with support for async data sources, debounced search, and custom item rendering. Use it when the option list is too large for a Selector dropdown.',
    bestPractices: [
      {guidance: true, description: 'Provide descriptive placeholder text that hints at what users can search for.'},
      {guidance: true, description: 'Show suggestions on focus when users benefit from seeing popular or recent options before typing.'},
      {guidance: true, description: 'Add a search delay for remote data sources to avoid excessive network requests.'},
      {guidance: false, description: 'Use for short, static option lists — use Selector for better discoverability.'},
      {guidance: false, description: 'Use for multi-selection — use Tokenizer instead.'},
      {guidance: false, description: 'Place multiple Typeaheads adjacent to each other without clear labels differentiating them.'},
    ],
  },
  components: [
    {
      name: 'XDSTypeahead',
      displayName: 'Typeahead',
      description: 'Styled typeahead w/ label, description, validation. Wraps XDSBaseTypeahead+XDSField.',
      propDescriptions: {
        label: 'Accessible label for input.',
        searchSource: 'Data source w/ search+bootstrap methods for populating dropdown.',
        value: 'Selected item or null.',
        onChange: 'Fired on selection change.',
        placeholder: 'Input placeholder text.',
        hasEntriesOnFocus: 'Show bootstrap results on focus before typing.',
        hasClear: 'Clear button to deselect current value.',
        isDisabled: 'Disables input.',
        maxMenuItems: 'Max dropdown items to display.',
        status: 'Validation status w/ type+message for error/warning/success.',
        renderItem: 'Custom dropdown item render. Default renders XDSTypeaheadItem.',
        isLabelHidden: 'Visually hides label; keeps a11y.',
        description: 'Helper text below label.',
        isRequired: 'Marks field required.',
        isOptional: 'Shows optional indicator on label.',
        labelTooltip: 'Tooltip on label.',
        emptySearchResultsText: 'Text when search returns no results.',
        hasAutoFocus: 'Auto-focus input on mount.',
        size: 'Input+token size.',
        debounceMs: 'Search debounce ms. 0 for sync.',
        onChangeQuery: 'Fired on search query text change.',
        onOpenChange: 'Fired on dropdown open/close.',
        xstyle: 'StyleX layout styles. Must be stylex.create() value.',
      },
    },
    {
      name: 'XDSBaseTypeahead',
      displayName: 'Base Typeahead',
      description: 'Unstyled combobox engine; input+search+keyboard nav+dropdown. No wrapper/border/token. Used by XDSTypeahead+XDSTokenizer.',
      propDescriptions: {
        searchSource: 'Data source w/ search+bootstrap methods.',
        value: 'Currently selected item.',
        onChange: 'Fired on selection change.',
        renderItem: 'Custom dropdown item render.',
        placeholder: 'Input placeholder.',
        hasEntriesOnFocus: 'Bootstrap results on focus.',
        maxMenuItems: 'Max dropdown items.',
        emptySearchResultsText: 'Text when no results.',
        isDisabled: 'Whether input disabled.',
        hasAutoFocus: 'Auto-focus on mount.',
        debounceMs: 'Search debounce ms. 0 for sync.',
        anchorRef: 'Anchor for dropdown positioning. Defaults to input.',
        inputXStyle: 'Additional StyleX styles for input.',
        onKeyDown: 'Keydown before internal nav. preventDefault() skips internal handling.',
        onChangeQuery: 'Fired on query text change.',
        onOpenChange: 'Fired on dropdown open/close.',
        inputId: 'Input ID for label association.',
        ariaDescribedBy: 'Additional aria-describedby IDs.',
      },
    },
    {
      name: 'XDSTypeaheadItem',
      displayName: 'Typeahead Item',
      description: 'Default dropdown item renderer. Label w/ optional icon, description, avatar. Exported for custom renderItem.',
      propDescriptions: {
        item: 'Search result item to render.',
        icon: 'Icon/avatar before label.',
        description: 'Text below label.',
        isDisabled: 'Visually disabled.',
        group: 'Group label for visual grouping.',
      },
    },
  ],
};
