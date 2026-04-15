/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Typeahead',
  description:
    'Searchable dropdown components for single-item selection with keyboard navigation. Supports async and sync search via a searchSource interface.',
  showcase: {
    aspectRatio: 4 / 3,
    code: '<XDSTypeahead label="Search" />',
  },
  keywords: ["typeahead","autocomplete","combobox","searchbox","autosuggest","select","dropdown","lookup","searchable","suggestion","picker"],
  features: [
    'Async and sync search via a searchSource interface with search() and bootstrap() methods',
    'Bootstrap results shown on focus before typing (via hasEntriesOnFocus)',
    'Edit mode: clicking selected token enters edit mode with text pre-populated and selected',
    'Combobox ARIA pattern for full accessibility',
    'Debounced search with configurable delay (default 150ms, set to 0 for synchronous sources)',
    'Two-layer architecture: XDSBaseTypeahead provides the engine, XDSTypeahead adds field chrome',
  ],  components: [
    {
      name: 'XDSTypeahead',
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
  accessibility: [
    'Uses combobox ARIA pattern with role="combobox", aria-expanded, aria-autocomplete="list".',
    'Dropdown uses role="listbox" with role="option" on each item.',
    'aria-activedescendant tracks the highlighted option.',
    'Selected item has aria-selected="true".',
    'Loading state has role="status" with aria-label="Loading".',
    'XDSTypeahead wraps in XDSField for label and description association.',
  ],
  keyboard:
    'Arrow keys navigate dropdown items; Enter selects highlighted item; Escape closes dropdown or restores previous value in edit mode; Home/End jump to first/last item',
  theming: {
    targets: [
      {className: 'xds-typeahead', visualProps: ['status']},
      {className: 'xds-typeahead-dropdown'},
      {className: 'xds-typeahead-item'},
    ],
  },
  notes: [
    'XDSSearchSource requires items to implement XDSSearchableItem ({ id: string; label: string; [key: string]: unknown }).',
    'Edit mode in XDSTypeahead: clicking the selected token removes it visually, populates the input with the label text, and selects all. Blurring without selecting restores the original token.',
    'XDSBaseTypeahead renders only the <input> and dropdown popover — consumers provide their own wrapper.',
    'If item has an element property, XDSTypeaheadItem renders it directly instead of the standard layout.',
  ],
  usage: {
    summary: 'Searchable dropdown for single-item selection with keyboard navigation and async data support.',
    content: `## When to use

- Selecting a single item from a large or dynamic dataset.
- Users benefit from search-as-you-type to find options.

## When NOT to use

- A small, fixed list of options (use Selector instead).
- Multiple selections needed (use Tokenizer instead).`,
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Typeahead',
  description:
    '可搜索的下拉组件，用于单项选择并支持键盘导航。通过 searchSource 接口支持异步和同步搜索。',
  features: [
    '通过 searchSource 接口支持异步和同步搜索，包含 search() 和 bootstrap() 方法',
    '聚焦时在输入前显示引导结果（通过 hasEntriesOnFocus）',
    '编辑模式：点击已选标记进入编辑模式，文本已预填并选中',
    '组合框 ARIA 模式，实现完整的无障碍支持',
    '防抖搜索，延迟可配置（默认 150ms，同步数据源设置为 0）',
    '双层架构：XDSBaseTypeahead 提供引擎，XDSTypeahead 添加字段外观',
  ],
  components: [
    {
      name: 'XDSTypeahead',
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
  accessibility: [
    '使用组合框 ARIA 模式，包含 role="combobox"、aria-expanded、aria-autocomplete="list"。',
    '下拉列表使用 role="listbox"，每个项使用 role="option"。',
    'aria-activedescendant 追踪高亮选项。',
    '选中项具有 aria-selected="true"。',
    '加载状态具有 role="status" 和 aria-label="Loading"。',
    'XDSTypeahead 包裹在 XDSField 中，用于标签和描述的关联。',
  ],
  keyboard:
    '方向键导航下拉列表项目；Enter 选择高亮项目；Escape 关闭下拉列表或在编辑模式中恢复之前的值；Home/End 跳转到第一个/最后一个项目',
  theming: {
    targets: [
      {className: 'xds-typeahead', visualProps: ['status']},
      {className: 'xds-typeahead-dropdown'},
      {className: 'xds-typeahead-item'},
    ],
  },
  notes: [
    'XDSSearchSource 要求项目实现 XDSSearchableItem（{ id: string; label: string; [key: string]: unknown }）。',
    'XDSTypeahead 中的编辑模式：点击已选标记会视觉移除它，将标签文本填入输入框并全选。在未选择的情况下失焦会恢复原始标记。',
    'XDSBaseTypeahead 仅渲染 <input> 和下拉弹出框 — 使用者需提供自己的包装器。',
    '如果项目具有 element 属性，XDSTypeaheadItem 会直接渲染它而不是标准布局。',
  ],
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'Searchable dropdown for single-item selection w/ keyboard navigation. Supports async+sync search via searchSource interface.',
  features: [
    'Async+sync search via searchSource w/ search()+bootstrap() methods',
    'Bootstrap results shown on focus before typing (via hasEntriesOnFocus)',
    'Edit mode: clicking selected token enters edit w/ text pre-populated+selected',
    'Combobox ARIA pattern for full a11y',
    'Debounced search w/ configurable delay (default 150ms, 0 for sync)',
    'Two-layer architecture: XDSBaseTypeahead provides engine, XDSTypeahead adds field chrome',
  ],
  notes: [
    'XDSSearchSource requires items implementing XDSSearchableItem ({ id: string; label: string; [key: string]: unknown }).',
    'Edit mode: clicking selected token removes it visually, populates input w/ label text, selects all. Blur w/o selecting restores original.',
    'XDSBaseTypeahead renders only <input>+dropdown popover; consumers provide wrapper.',
    'If item has element property, XDSTypeaheadItem renders it directly instead of standard layout.',
  ],
  accessibility: [
    'Combobox ARIA: role="combobox", aria-expanded, aria-autocomplete="list".',
    'Dropdown role="listbox" w/ role="option" on each item.',
    'aria-activedescendant tracks highlighted option.',
    'Selected item has aria-selected="true".',
    'Loading state has role="status" w/ aria-label="Loading".',
    'XDSTypeahead wraps in XDSField for label+description association.',
  ],
  keyboard: 'Arrow keys navigate dropdown items. Enter selects highlighted item. Escape closes dropdown or restores previous value in edit mode. Home/End jump to first/last item.',
  components: [
    {
      name: 'XDSTypeahead',
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
