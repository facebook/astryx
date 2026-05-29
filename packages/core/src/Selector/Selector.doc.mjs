// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Selector',
  displayName: 'Selector',
  group: 'Selector',
  category: 'Inputs',
  keywords: ["selector","select","dropdown","combobox","picker","listbox","chooser","autocomplete","option","selectmenu"],
  theming: {
    targets: [
      {className: 'xds-selector', visualProps: ['size', 'status']},
      {className: 'xds-selector-option'},
    ],
  },
  components: [
    {
      name: 'XDSSelector',
      displayName: 'Selector',
      description: 'Dropdown selector for choosing from a list of options.',
      props: [
        {
          name: 'label',
          type: 'string',
          description: 'Label text for accessibility.',
          required: true,
        },
        {
          name: 'options',
          type: 'XDSSelectorOption[]',
          description:
            'Array of items — strings, objects with value/label/icon/disabled, dividers ({type: "divider"}), or sections ({type: "section", title, items}).',
          required: true,
        },
        {
          name: 'value',
          type: 'string',
          description: 'Currently selected value.',
        },
        {
          name: 'onChange',
          type: '(value: string) => void',
          description: 'Callback fired when the selection changes.',
        },
        {
          name: 'hasClear',
          type: 'boolean',
          description:
            'Shows a clear (\u00d7) button when a value is selected. When true, onChange also accepts null to signal the user cleared the selection.',
          default: 'false',
        },
        {
          name: 'hasSearch',
          type: 'boolean',
          description: 'Whether to show a search input for filtering options.',
          default: 'false',
        },
        {
          name: 'searchPlaceholder',
          type: 'string',
          description: 'Placeholder text for the search input.',
          default: "'Search...'",
        },
        {
          name: 'placeholder',
          type: 'string',
          description: 'Placeholder text shown when no value is selected.',
          default: "'Select...'",
        },
        {
          name: 'size',
          type: "'sm' | 'md' | 'lg'",
          description: 'Size variant for the selector.',
          default: "'md'",
        },
        {
          name: 'isDisabled',
          type: 'boolean',
          description: 'Disables the selector.',
        },
        {
          name: 'isLabelHidden',
          type: 'boolean',
          description: 'Visually hides the label while keeping it accessible.',
        },
        {
          name: 'description',
          type: 'string',
          description: 'Helper text displayed below the label.',
        },
        {
          name: 'isOptional',
          type: 'boolean',
          description: 'Marks the field as optional.',
        },
        {
          name: 'isRequired',
          type: 'boolean',
          description: 'Marks the field as required.',
        },
        {
          name: 'status',
          type: "{type: 'error' | 'warning' | 'success', message?: string}",
          description: 'Validation status with an optional message.',
        },
        {
          name: 'children',
          type: '(item: XDSSelectorOptionData) => ReactNode',
          description: 'Custom render function for each item in the dropdown.',
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value — not an inline style object like style={{}}.',
        },
      ],
    },
    {
      name: 'XDSSelectorOption',
      displayName: 'Selector Option',
      description:
        'Helper component for custom item rendering inside an XDSSelector children render prop.',
      props: [
        {
          name: 'label',
          type: 'ReactNode',
          description: 'Primary label text for the item.',
          required: true,
        },
        {
          name: 'icon',
          type: 'XDSIconType',
          description: 'Icon displayed before the label. See `npx xds docs icons` for valid semantic names.',
        },
        {
          name: 'description',
          type: 'ReactNode',
          description: 'Secondary description text displayed below the label.',
        },
      ],
    },
  ],
  usage: {
    description:
      'A dropdown selector for choosing a single value from a list of options. Supports labels, validation, descriptions, and required/optional states. Use it in forms and settings when presenting a moderate number of options.',
    bestPractices: [
      {guidance: true, description: 'Provide a visible label so users understand what they are selecting.'},
      {guidance: true, description: 'Use sections and dividers to organize options when the list exceeds ~8 items.'},
      {guidance: true, description: 'Set a meaningful placeholder that hints at the expected selection (e.g. "Choose a country" not "Select...").'},
      {guidance: false, description: 'Use for action menus — use Dropdown Menu for triggering commands or navigation.'},
      {guidance: false, description: 'Use when there are only two options — use a SegmentedControl or radio buttons instead.'},
      {guidance: false, description: 'Use Selector for navigation — links should be links, not dropdown options.'},
      {guidance: false, description: 'Use for yes/no or on/off choices — use Switch or CheckboxInput instead.'},
      {guidance: false, description: 'Put more than ~20 options without sections — consider Typeahead for large lists.'},
    ],
    anatomy: [
      {name: 'Label', required: false, description: 'Text label displayed above the selector.'},
      {name: 'Placeholder', required: false, description: 'Hint text shown when no value is selected.'},
      {name: 'Description', required: false, description: 'Helper text providing additional context.'},
      {name: 'Left Icon', required: false, description: 'Icon displayed to the left of the selected value.'},
      {name: 'Value', required: true, description: 'The currently selected item displayed in the selector.'},
      {name: 'List', required: true, description: 'The dropdown list of selectable options.'},
    ],
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Selector',
  displayName: 'Selector',
  theming: {
    targets: [
      {className: 'xds-selector', visualProps: ['size', 'status']},
      {className: 'xds-selector-option'},
    ],
  },
  components: [
    {
      name: 'XDSSelector',
      displayName: 'Selector',
      description: '用于从选项列表中进行选择的下拉选择器。',
      props: [
        {
          name: 'label',
          type: 'string',
          description: '无障碍标签文本。',
          required: true,
        },
        {
          name: 'options',
          type: 'XDSSelectorOption[]',
          description:
            '选项数组 - 字符串、带 value/label/icon/disabled 的对象、分隔线（{type: "divider"}）或分组（{type: "section", title, items}）。',
          required: true,
        },
        {
          name: 'value',
          type: 'string',
          description: '当前选中的值。',
        },
        {
          name: 'onChange',
          type: '(value: string) => void',
          description: '选择变更时触发的回调函数。',
        },
        {
          name: 'hasClear',
          type: 'boolean',
          description: '选中值时显示清除 (×) 按鈕。启用后，onChange 还接受 null 表示用户已清除选择。',
          default: 'false',
        },
        {
          name: 'hasSearch',
          type: 'boolean',
          description: '是否显示用于过滤选项的搜索输入。',
          default: 'false',
        },
        {
          name: 'searchPlaceholder',
          type: 'string',
          description: '搜索输入的占位文本。',
          default: "'Search...'",
        },
        {
          name: 'placeholder',
          type: 'string',
          description: '未选择值时显示的占位文本。',
          default: "'Select...'",
        },
        {
          name: 'size',
          type: "'sm' | 'md' | 'lg'",
          description: '选择器的尺寸变体。',
          default: "'md'",
        },
        {
          name: 'isDisabled',
          type: 'boolean',
          description: '禁用选择器。',
        },
        {
          name: 'isLabelHidden',
          type: 'boolean',
          description: '视觉上隐藏标签，同时保持无障碍可访问性。',
        },
        {
          name: 'description',
          type: 'string',
          description: '显示在标签下方的辅助文本。',
        },
        {
          name: 'isOptional',
          type: 'boolean',
          description: '将字段标记为可选。',
        },
        {
          name: 'isRequired',
          type: 'boolean',
          description: '将字段标记为必填。',
        },
        {
          name: 'status',
          type: "{type: 'error' | 'warning' | 'success', message?: string}",
          description: '验证状态，附带可选消息。',
        },
        {
          name: 'children',
          type: '(item: XDSSelectorOptionData) => ReactNode',
          description: '下拉菜单中每个选项的自定义渲染函数。',
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            '用于布局自定义的 StyleX 样式（边距、定位、尺寸）。必须是 stylex.create() 的值，而非内联样式对象如 style={{}}。',
        },
      ],
    },
    {
      name: 'XDSSelectorOption',
      displayName: 'Selector Option',
      description:
        '用于在 XDSSelector 的 children 渲染函数中自定义选项渲染的辅助组件。',
      props: [
        {
          name: 'label',
          type: 'ReactNode',
          description: '选项的主标签文本。',
          required: true,
        },
        {
          name: 'icon',
          type: 'XDSIconType',
          description: '显示在标签前的图标。',
        },
        {
          name: 'description',
          type: 'ReactNode',
          description: '显示在标签下方的次要描述文本。',
        },
      ],
    },
  ],
  usage: {
    description:
      'A dropdown selector for choosing a single value from a list of options. Supports labels, validation, descriptions, and required/optional states. Use it in forms and settings when presenting a moderate number of options.',
    bestPractices: [
      {guidance: true, description: 'Provide a visible label so users understand what they are selecting.'},
      {guidance: true, description: 'Use sections and dividers to organize options when the list exceeds ~8 items.'},
      {guidance: true, description: 'Set a meaningful placeholder that hints at the expected selection (e.g. "Choose a country" not "Select...").'},
      {guidance: false, description: 'Use for action menus — use Dropdown Menu for triggering commands or navigation.'},
      {guidance: false, description: 'Use when there are only two options — use a SegmentedControl or radio buttons instead.'},
      {guidance: false, description: 'Use Selector for navigation — links should be links, not dropdown options.'},
      {guidance: false, description: 'Use for yes/no or on/off choices — use Switch or CheckboxInput instead.'},
      {guidance: false, description: 'Put more than ~20 options without sections — consider Typeahead for large lists.'},
    ],
    anatomy: [
      {name: 'Label', required: false, description: 'Text label displayed above the selector.'},
      {name: 'Placeholder', required: false, description: 'Hint text shown when no value is selected.'},
      {name: 'Description', required: false, description: 'Helper text providing additional context.'},
      {name: 'Left Icon', required: false, description: 'Icon displayed to the left of the selected value.'},
      {name: 'Value', required: true, description: 'The currently selected item displayed in the selector.'},
      {name: 'List', required: true, description: 'The dropdown list of selectable options.'},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  usage: {
    description:
      'A dropdown selector for choosing a single value from a list of options. Supports labels, validation, descriptions, and required/optional states. Use it in forms and settings when presenting a moderate number of options.',
    bestPractices: [
      {guidance: true, description: 'Provide a visible label so users understand what they are selecting.'},
      {guidance: true, description: 'Use sections and dividers to organize options when the list exceeds ~8 items.'},
      {guidance: true, description: 'Set a meaningful placeholder that hints at the expected selection (e.g. "Choose a country" not "Select...").'},
      {guidance: false, description: 'Use for action menus — use Dropdown Menu for triggering commands or navigation.'},
      {guidance: false, description: 'Use when there are only two options — use a SegmentedControl or radio buttons instead.'},
      {guidance: false, description: 'Use Selector for navigation — links should be links, not dropdown options.'},
      {guidance: false, description: 'Use for yes/no or on/off choices — use Switch or CheckboxInput instead.'},
      {guidance: false, description: 'Put more than ~20 options without sections — consider Typeahead for large lists.'},
    ],
    anatomy: [
      {name: 'Label', required: false, description: 'Text label displayed above the selector.'},
      {name: 'Placeholder', required: false, description: 'Hint text shown when no value is selected.'},
      {name: 'Description', required: false, description: 'Helper text providing additional context.'},
      {name: 'Left Icon', required: false, description: 'Icon displayed to the left of the selected value.'},
      {name: 'Value', required: true, description: 'The currently selected item displayed in the selector.'},
      {name: 'List', required: true, description: 'The dropdown list of selectable options.'},
    ],
  },
  components: [
    {
      name: 'XDSSelector',
      displayName: 'Selector',
      description: 'Dropdown selector for choosing from list of options.',
      propDescriptions: {
        label: 'Label text for accessibility.',
        options: 'Array of items; strings, objects w/ value/label/icon/disabled, dividers ({type: "divider"}), sections ({type: "section", title, items}).',
        value: 'Currently selected value.',
        onChange: 'Callback fired when selection changes.',
        hasClear: 'Shows clear button when value selected. onChange also accepts null on clear.',
        hasSearch: 'Shows search input for filtering options.',
        searchPlaceholder: 'Placeholder text for search input.',
        placeholder: 'Placeholder text when no value selected.',
        size: 'Size variant for selector.',
        isDisabled: 'Disables selector.',
        isLabelHidden: 'Visually hides label while keeping accessible.',
        description: 'Helper text below label.',
        isOptional: 'Marks field optional.',
        isRequired: 'Marks field required.',
        status: 'Validation status w/ optional message.',
        children: 'Custom render function for each dropdown item.',
        xstyle: 'StyleX styles for layout customization. Must be stylex.create() value.',
      },
    },
    {
      name: 'XDSSelectorOption',
      displayName: 'Selector Option',
      description:
        'Helper component for custom item rendering inside XDSSelector children render prop.',
      propDescriptions: {
        label: 'Primary label text for item.',
        icon: 'Icon displayed before label.',
        description: 'Secondary description text below label.',
      },
    },
  ],
};
