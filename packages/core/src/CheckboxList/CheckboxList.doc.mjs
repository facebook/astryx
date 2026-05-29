// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'CheckboxList',
  displayName: 'Checkbox List',
  group: 'Checkbox',
  category: 'Inputs',
  keywords: ["checkboxlist","checkbox","checkboxgroup","multichoice","multiselect","checklist"],
  components: [
    {
      name: 'XDSCheckboxList',
      displayName: 'Checkbox List',
      description:
        'Checkbox group container with field integration for label, description, and status.',      props: [
        {
          name: 'label',
          type: 'string',
          description:
            'Label text for the checkbox group (always rendered for accessibility).',
          required: true,
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: 'XDSCheckboxListItem elements.',
          slotElements: [{__element: 'XDSCheckboxListItem', props: {label: 'Option', value: 'option'}}],
          required: true,
        },
        {
          name: 'value',
          type: 'string[]',
          description: 'The currently selected values (collection mode).',
        },
        {
          name: 'onChange',
          type: '(values: string[]) => void',
          description: 'Callback fired when the selected values change.',
        },
        {
          name: 'changeAction',
          type: '(values: string[]) => void | Promise<void>',
          description: 'Async action on change with optimistic updates.',
        },
        {
          name: 'isLoading',
          type: 'boolean',
          description: 'External loading state.',
          default: 'false',
        },
        {
          name: 'isLabelHidden',
          type: 'boolean',
          description: 'Whether to visually hide the label.',
          default: 'false',
        },
        {
          name: 'description',
          type: 'string',
          description: 'Description text displayed below the label.',
        },
        {
          name: 'density',
          type: "'compact' | 'balanced' | 'spacious'",
          description: 'Spacing density for list items.',
          default: "'balanced'",
        },
        {
          name: 'hasDividers',
          type: 'boolean',
          description: 'Whether to show dividers between items.',
          default: 'false',
        },
        {
          name: 'isDisabled',
          type: 'boolean',
          description: 'Whether all checkbox items are disabled.',
          default: 'false',
        },
        {
          name: 'status',
          type: 'XDSInputStatus',
          description: 'Status indicator ({ type, message }).',
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
      name: 'XDSCheckboxListItem',
      displayName: 'Checkbox List Item',
      description:
        'Individual checkbox item with label, description, and end content slot. Works in collection mode (inside XDSCheckboxList) or standalone mode (inside XDSList).',
      props: [
        {
          name: 'label',
          type: 'string',
          description: 'Primary text label for the item.',
          required: true,
        },
        {
          name: 'value',
          type: 'string',
          description: 'Identity key (required inside XDSCheckboxList).',
        },
        {
          name: 'description',
          type: 'string',
          description: 'Secondary text below the label.',
        },
        {
          name: 'endContent',
          type: 'ReactNode',
          description: 'Content rendered after the label area.',
          slotElements: [
            {__element: 'XDSIcon', props: {icon: 'chevronDown', size: 'sm'}},
            {__element: 'XDSBadge', props: {label: '3'}},
          ],
        },
        {
          name: 'isDisabled',
          type: 'boolean',
          description: 'Whether this individual item is disabled.',
          default: 'false',
        },
        {
          name: 'isChecked',
          type: "boolean | 'indeterminate'",
          description: 'Direct checked state (standalone mode only).',
        },
        {
          name: 'onCheck',
          type: '(checked: boolean) => void',
          description: 'Direct check handler (standalone mode only).',
        },
      ],
    },
  ],
  usage: {
    description: 'CheckboxList shows a small group of checkboxes so users can turn several options on or off at once. Place it in settings pages, filter panels, or forms where every choice should be visible without scrolling. For a single standalone checkbox — like "I agree to the terms" — use CheckboxInput instead. If only one option can be picked, use RadioList. If the list is long enough to need searching or scrolling, use MultiSelector instead.',
    bestPractices: [
      { guidance: true, description: 'Keep the list short — three to seven options is the sweet spot. Beyond that, switch to MultiSelector which adds search and scrolling.' },
      { guidance: true, description: 'Turn on dividers (hasDividers) when items have helper text underneath — without them the labels and descriptions blur together.' },
      { guidance: true, description: 'Write a group label that says what the choices represent — "Export formats" tells users more than "Options".' },
      { guidance: false, description: 'Show a CheckboxList when the user can only pick one thing — that is what RadioList is for.' },
      { guidance: false, description: 'Put buttons or links inside the trailing slot (endContent) — the whole row is already tappable, so a nested button creates two competing click targets.' },
    ],
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'CheckboxList',
  displayName: 'Checkbox List',
  usage: {
    description: 'CheckboxList shows a small group of checkboxes so users can turn several options on or off at once. Place it in settings pages, filter panels, or forms where every choice should be visible without scrolling. For a single standalone checkbox — like "I agree to the terms" — use CheckboxInput instead. If only one option can be picked, use RadioList. If the list is long enough to need searching or scrolling, use MultiSelector instead.',
    bestPractices: [
      { guidance: true, description: 'Keep the list short — three to seven options is the sweet spot. Beyond that, switch to MultiSelector which adds search and scrolling.' },
      { guidance: true, description: 'Turn on dividers (hasDividers) when items have helper text underneath — without them the labels and descriptions blur together.' },
      { guidance: true, description: 'Write a group label that says what the choices represent — "Export formats" tells users more than "Options".' },
      { guidance: false, description: 'Show a CheckboxList when the user can only pick one thing — that is what RadioList is for.' },
      { guidance: false, description: 'Put buttons or links inside the trailing slot (endContent) — the whole row is already tappable, so a nested button creates two competing click targets.' },
    ],
  },
  components: [
    {
      name: 'XDSCheckboxList',
      displayName: 'Checkbox List',
      description: '复选框组容器，集成字段功能，支持标签、描述和状态。',
      props: [
        {name: 'label', type: 'string', description: '复选框组的标签文本（始终渲染以确保无障碍可访问性）。', required: true},
        {name: 'children', type: 'ReactNode', description: 'XDSCheckboxListItem 元素。', required: true},
        {name: 'value', type: 'string[]', description: '当前选中的值（集合模式）。'},
        {name: 'onChange', type: '(values: string[]) => void', description: '选中值变更时触发的回调函数。'},
        {name: 'changeAction', type: '(values: string[]) => void | Promise<void>', description: '变更时的异步操作，配合乐观更新。'},
        {name: 'isLoading', type: 'boolean', description: '外部加载状态。', default: 'false'},
        {name: 'isLabelHidden', type: 'boolean', description: '是否在视觉上隐藏标签。', default: 'false'},
        {name: 'description', type: 'string', description: '显示在标签下方的描述文本。'},
        {name: 'density', type: "'compact' | 'balanced' | 'spacious'", description: '列表项的间距密度。', default: "'balanced'"},
        {name: 'hasDividers', type: 'boolean', description: '是否在选项之间显示分隔线。', default: 'false'},
        {name: 'isDisabled', type: 'boolean', description: '是否禁用所有复选框选项。', default: 'false'},
        {name: 'status', type: 'XDSInputStatus', description: '状态指示器（{ type, message }）。'},
        {name: 'xstyle', type: 'StyleXStyles', description: '用于布局自定义的 StyleX 样式。必须是 stylex.create() 的值。'},
      ],
    },
    {
      name: 'XDSCheckboxListItem',
      displayName: 'Checkbox List Item',
      description: '单个复选框选项，包含标签、描述和尾部内容插槽。可在集合模式或独立模式下使用。',
      props: [
        {name: 'label', type: 'string', description: '选项的主要文本标签。', required: true},
        {name: 'value', type: 'string', description: '标识键（在 XDSCheckboxList 内为必填）。'},
        {name: 'description', type: 'string', description: '标签下方的辅助文本。'},
        {name: 'endContent', type: 'ReactNode', description: '在标签区域后渲染的内容。'},
        {name: 'isDisabled', type: 'boolean', description: '是否禁用此单个选项。', default: 'false'},
        {name: 'isChecked', type: "boolean | 'indeterminate'", description: '直接选中状态（仅独立模式）。'},
        {name: 'onCheck', type: '(checked: boolean) => void', description: '直接选中处理器（仅独立模式）。'},
      ],
    },
  ],
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'Checkbox group component for multi-value selection. Collection mode (parent state) + standalone mode (per-item state).',
  usage: {
    description: 'CheckboxList shows a small group of checkboxes so users can turn several options on or off at once. Place it in settings pages, filter panels, or forms where every choice should be visible without scrolling. For a single standalone checkbox — like "I agree to the terms" — use CheckboxInput instead. If only one option can be picked, use RadioList. If the list is long enough to need searching or scrolling, use MultiSelector instead.',
    bestPractices: [
      { guidance: true, description: 'Keep the list short — three to seven options is the sweet spot. Beyond that, switch to MultiSelector which adds search and scrolling.' },
      { guidance: true, description: 'Turn on dividers (hasDividers) when items have helper text underneath — without them the labels and descriptions blur together.' },
      { guidance: true, description: 'Write a group label that says what the choices represent — "Export formats" tells users more than "Options".' },
      { guidance: false, description: 'Show a CheckboxList when the user can only pick one thing — that is what RadioList is for.' },
      { guidance: false, description: 'Put buttons or links inside the trailing slot (endContent) — the whole row is already tappable, so a nested button creates two competing click targets.' },
    ],
  },
  components: [
    {
      name: 'XDSCheckboxList',
      displayName: 'Checkbox List',
      description:
        'Checkbox group container w/ field integration for label, description, status.',
      propDescriptions: {
        label: 'Label text for checkbox group (always rendered for accessibility).',
        children: 'XDSCheckboxListItem elements.',
        value: 'Currently selected values (collection mode).',
        onChange: 'Callback fired when selected values change.',
        changeAction: 'Async action on change w/ optimistic updates.',
        isLoading: 'External loading state.',
        isLabelHidden: 'Whether to visually hide label.',
        description: 'Description text below label.',
        density: 'Spacing density for list items.',
        hasDividers: 'Whether to show dividers between items.',
        isDisabled: 'Whether all checkbox items disabled.',
        status: 'Status indicator ({ type, message }).',
        xstyle: 'StyleX styles for layout customization. Must be stylex.create() value.',
      },
    },
    {
      name: 'XDSCheckboxListItem',
      displayName: 'Checkbox List Item',
      description:
        'Individual checkbox item w/ label, description, end content slot.',
      propDescriptions: {
        label: 'Primary text label for item.',
        value: 'Identity key (required inside XDSCheckboxList).',
        description: 'Secondary text below label.',
        endContent: 'Content rendered after label area.',
        isDisabled: 'Whether this individual item disabled.',
        isChecked: 'Direct checked state (standalone mode only).',
        onCheck: 'Direct check handler (standalone mode only).',
      },
    },
  ],
};
