// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'CheckboxInput',
  displayName: 'Checkbox Input',
  group: 'Checkbox',
  category: 'Data Input',
  keywords: ["checkbox","check","toggle","tick","indeterminate","boolean","tristate"],
  props: [
    {
      name: 'ref',
      type: 'React.Ref<HTMLInputElement>',
      description:
        'Ref forwarded to the underlying <input> element.',
    },
    {
      name: 'label',
      type: 'string',
      description:
        'Label text for the checkbox (always rendered for accessibility).',
      required: true,
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description: 'Whether to visually hide the label (still accessible to screen readers).',
      default: 'false',
    },
    {
      name: 'description',
      type: 'string',
      description: 'Description text displayed below the label.',
    },
    {
      name: 'value',
      type: "boolean | 'indeterminate'",
      description:
        'Whether the checkbox is checked, unchecked, or indeterminate.',
      required: true,
    },
    {
      name: 'onChange',
      type: '(checked: boolean, e: ChangeEvent<HTMLInputElement>) => void',
      description: 'Callback fired when the checkbox state changes.',
    },
    {
      name: 'changeAction',
      type: '(checked: boolean, e: ChangeEvent<HTMLInputElement>) => void | Promise<void>',
      description:
        'Async action on change. Fires after onChange if not prevented. Shows loading spinner while pending.',
    },
    {
      name: 'isLoading',
      type: 'boolean',
      description: 'Whether the checkbox is in a loading state. Shows spinner and prevents interaction.',
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: 'Whether the checkbox is disabled.',
      default: 'false',
    },
    {
      name: 'isOptional',
      type: 'boolean',
      description: 'Whether the field is optional. Mutually exclusive with isRequired.',
      default: 'false',
    },
    {
      name: 'isRequired',
      type: 'boolean',
      description: 'Whether the checkbox is required. Mutually exclusive with isOptional.',
      default: 'false',
    },
    {
      name: 'size',
      type: "'sm' | 'md'",
      description: 'The size of the checkbox. sm for compact layouts, md for default.',
      default: "'md'",
    },
    {
      name: 'onFocus',
      type: '(e: FocusEvent<HTMLInputElement>) => void',
      description: 'Callback fired when the checkbox receives focus.',
    },
    {
      name: 'onBlur',
      type: '(e: FocusEvent<HTMLInputElement>) => void',
      description: 'Callback fired when the checkbox loses focus.',
    },
    {
      name: 'labelIcon',
      type: 'IconType',
      description: 'Icon to display before the label text. See `npx astryx docs icons` for valid semantic names.',
    },
    {
      name: 'status',
      type: "{ type: 'error' | 'warning' | 'success', message: string }",
      description:
        'Status indicator. Displays a colored message box below the checkbox and sets aria-invalid for errors.',
    },
  ],
  theming: {
    targets: [
      {className: 'xds-checkbox-input', visualProps: ['size']},
      {className: 'xds-checkbox'},
    ],
  },
  usage: {
    description: 'CheckboxInput toggles a single on/off value. Use it for settings like "Enable notifications", terms acceptance, or opt-in choices. For multiple checkboxes in a group, use CheckboxList instead.',
    bestPractices: [
      { guidance: true, description: 'Always provide a visible label so the user knows what they are toggling. Use isLabelHidden only when surrounding context makes it obvious.' },
      { guidance: true, description: 'Add a description for choices that need extra context, like explaining what "Share usage data" actually shares.' },
      { guidance: true, description: 'Use the indeterminate state for "select all" checkboxes when only some items in a group are selected.' },
      { guidance: false, description: 'Use a checkbox for mutually exclusive choices; use RadioList when only one option can be selected.' },
      { guidance: false, description: 'Use a checkbox for actions that take effect immediately; use a toggle switch or button instead.' },
    ],
    anatomy: [
      { name: 'Checkbox', required: true, description: 'The check box itself: unchecked, checked, or indeterminate.' },
      { name: 'Label', required: true, description: 'Text describing what the checkbox controls. Always present for accessibility.' },
      { name: 'Description', required: false, description: 'Helper text below the label with additional context.' },
      { name: 'Status message', required: false, description: 'An error, warning, or success message below the checkbox.' },
    ],
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'CheckboxInput',
  displayName: 'Checkbox Input',
  usage: {
    description: 'CheckboxInput toggles a single on/off value. Use it for settings like "Enable notifications", terms acceptance, or opt-in choices. For multiple checkboxes in a group, use CheckboxList instead.',
    bestPractices: [
      { guidance: true, description: 'Always provide a visible label so the user knows what they are toggling. Use isLabelHidden only when surrounding context makes it obvious.' },
      { guidance: true, description: 'Add a description for choices that need extra context, like explaining what "Share usage data" actually shares.' },
      { guidance: true, description: 'Use the indeterminate state for "select all" checkboxes when only some items in a group are selected.' },
      { guidance: false, description: 'Use a checkbox for mutually exclusive choices; use RadioList when only one option can be selected.' },
      { guidance: false, description: 'Use a checkbox for actions that take effect immediately; use a toggle switch or button instead.' },
    ],
  },
  props: [
    {name: 'ref', type: 'React.Ref<HTMLInputElement>', description: '转发至底层 <input> 元素的 ref。'},
    {name: 'label', type: 'string', description: '复选框的标签文本（始终为无障碍性而渲染）。', required: true},
    {name: 'isLabelHidden', type: 'boolean', description: '是否视觉隐藏标签（屏幕阅读器仍可访问）。', default: 'false'},
    {name: 'description', type: 'string', description: '显示在标签下方的描述文本。'},
    {name: 'value', type: "boolean | 'indeterminate'", description: '复选框是否为选中、未选中或不确定状态。', required: true},
    {name: 'onChange', type: '(checked: boolean, e: ChangeEvent<HTMLInputElement>) => void', description: '复选框状态变更时触发的回调。'},
    {
      name: 'changeAction',
      type:
        '(checked: boolean, e: ChangeEvent<HTMLInputElement>) => void | Promise<void>',
      description: '异步变更操作。在 onChange 之后触发（未被阻止时）。等待期间显示加载旋转器。',
    },
    {name: 'isLoading', type: 'boolean', description: '复选框是否处于加载状态。显示旋转器并阻止交互。', default: 'false'},
    {name: 'isDisabled', type: 'boolean', description: '复选框是否禁用。', default: 'false'},
    {name: 'isOptional', type: 'boolean', description: '字段是否可选。与 isRequired 互斥。', default: 'false'},
    {name: 'isRequired', type: 'boolean', description: '复选框是否必填。与 isOptional 互斥。', default: 'false'},
    {name: 'size', type: "'sm' | 'md'", description: '复选框尺寸。sm 用于紧凑布局，md 为默认。', default: "'md'"},
    {name: 'onFocus', type: '(e: FocusEvent<HTMLInputElement>) => void', description: '复选框获得焦点时触发的回调。'},
    {name: 'onBlur', type: '(e: FocusEvent<HTMLInputElement>) => void', description: '复选框失去焦点时触发的回调。'},
    {name: 'labelIcon', type: 'IconType', description: '标签文本前显示的图标。'},
    {
      name: 'status',
      type: "{ type: 'error' | 'warning' | 'success', message: string }",
      description: '状态指示器。在复选框下方显示彩色消息框，错误时设置 aria-invalid。',
    },
  ],
  theming: {
    targets: [
      {
        className: 'xds-checkbox-input',
        visualProps: [
          'size',
        ],
      },
      {className: 'xds-checkbox'},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'single on/off toggle for settings, terms, and opt-in choices',
  usage: {
    description: 'CheckboxInput toggles a single on/off value. Use for settings, terms acceptance, opt-in choices. Use CheckboxList for groups.',
    bestPractices: [
      { guidance: true, description: 'Always provide a visible label so user knows what they\'re toggling. Use isLabelHidden only when surrounding context makes it obvious.' },
      { guidance: true, description: 'Add a description for choices that need extra context, e.g. what "Share usage data" actually shares.' },
      { guidance: true, description: 'Use the indeterminate state for "select all" checkboxes when only some items in a group are selected.' },
      { guidance: false, description: 'Use a checkbox for mutually exclusive choices; use RadioList when only one option can be selected.' },
      { guidance: false, description: 'Use a checkbox for actions that take effect immediately; use a toggle switch or button instead.' },
    ],
  },
  propDescriptions: {
    ref: 'ref forwarded to underlying <input>',
    label: 'label text; always rendered for a11y',
    isLabelHidden: 'visually hide label (still accessible to screen readers)',
    description: 'text below label',
    value: 'checked, unchecked, or indeterminate',
    onChange: 'callback on state change',
    changeAction: 'async action; fires after onChange, shows spinner while pending',
    isLoading: 'shows spinner + prevents interaction',
    isDisabled: 'disable checkbox',
    isOptional: 'mark field as optional (mutually exclusive w/ isRequired)',
    isRequired: 'mark field as required (mutually exclusive w/ isOptional)',
    size: 'sm (compact) or md (default)',
    onFocus: 'callback on focus',
    onBlur: 'callback on blur',
    labelIcon: 'icon before label text',
    status: 'error/warning/success with message; sets aria-invalid on error',
  },
};
