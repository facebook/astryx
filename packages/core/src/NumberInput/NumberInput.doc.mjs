// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'NumberInput',
  displayName: 'Number Input',
  category: 'Inputs',
  keywords: ["numberinput","numberfield","stepper","spinner","counter","increment","decrement","quantity","numberpicker"],
  props: [
    {
      name: 'label',
      type: 'string',
      description:
        'Label text for the input (always rendered for accessibility).',
      required: true,
    },
    {
      name: 'value',
      type: 'number | null | undefined',
      description: 'Current value of the input.',
      required: true,
    },
    {
      name: 'onChange',
      type: '(value: number) => void',
      description:
        'Callback fired when input value changes (only on valid input).',
      required: true,
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: 'Size variant.',
      default: "'md'",
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description:
        'Visually hide the label (still accessible to screen readers).',
    },
    {
      name: 'description',
      type: 'string',
      description: 'Description text displayed between the label and input.',
    },
    {
      name: 'isOptional',
      type: 'boolean',
      description:
        'Whether the field is optional (mutually exclusive with isRequired).',
    },
    {
      name: 'isRequired',
      type: 'boolean',
      description:
        'Whether the field is required (mutually exclusive with isOptional).',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: 'Whether the input is disabled.',
    },
    {
      name: 'placeholder',
      type: 'string',
      description: 'Placeholder text.',
    },
    {
      name: 'labelTooltip',
      type: 'string',
      description:
        'Tooltip text to display in an info icon at the end of the label.',
    },
    {
      name: 'startIcon',
      type: 'XDSIconType',
      description: 'Icon to display at the start of the input. See `npx xds docs icons` for valid semantic names.',
    },
    {
      name: 'labelIcon',
      type: 'XDSIconType',
      description: 'Icon to display before the label text. See `npx xds docs icons` for valid semantic names.',
    },
    {
      name: 'status',
      type: "{type: 'error' | 'warning' | 'success', message?: string}",
      description: 'Validation status with optional message.',
    },
    {
      name: 'min',
      type: 'number | null',
      description: 'Minimum value allowed.',
    },
    {
      name: 'max',
      type: 'number | null',
      description: 'Maximum value allowed.',
    },
    {
      name: 'step',
      type: 'number | null',
      description: 'Step increment for the input.',
      default: '1',
    },
    {
      name: 'units',
      type: 'string | null',
      description:
        'Units text to display at the end of the input (e.g., "%" or "GB").',
    },
    {
      name: 'isIntegerOnly',
      type: 'boolean',
      description: 'Only allow integer values (no floating point).',
    },
    {
      name: 'hasClear',
      type: 'boolean',
      description:
        'Shows a clear (\u00d7) button when the input has a value. When true, the onChange callback also accepts null to signal the user cleared the input.',
      default: 'false',
    },
    {
      name: 'htmlName',
      type: 'string',
      description: 'HTML name attribute for form submissions.',
    },
    {
      name: 'autoComplete',
      type: 'string',
      description: 'HTML autocomplete attribute.',
    },
    {
      name: 'hasAutoFocus',
      type: 'boolean',
      description: 'Whether to focus the input on mount.',
    },
    {
      name: 'onFocus',
      type: '(e: FocusEvent<HTMLInputElement>) => void',
      description: 'Callback fired when the input receives focus.',
    },
    {
      name: 'onBlur',
      type: '(e: FocusEvent<HTMLInputElement>) => void',
      description: 'Callback fired when the input loses focus.',
    },
    {
      name: 'onEnter',
      type: '() => void',
      description: 'Callback fired when the user presses the Enter key.',
    },
  ],
  theming: {
    targets: [
      {className: 'xds-number-input', visualProps: ['size', 'status']},
    ],
  },
  usage: {
    description:
      'A form input for numeric values with built-in validation, min/max constraints, and step controls. Use NumberInput for quantities, measurements, percentages, and similar inputs.',
    bestPractices: [
      { guidance: true, description: 'Set min, max, and step to guide users toward valid values.' },
      { guidance: true, description: 'Show units (e.g. "%" or "GB") so users know what the number represents.' },
      { guidance: false, description: 'Use NumberInput for free-form text that happens to contain numbers — use TextInput instead.' },
      { guidance: false, description: 'Set both isOptional and isRequired on the same field.' },
    ],
    anatomy: [
      {name: 'Label', required: true, description: 'The label for the number input.'},
      {name: 'Description', required: false, description: 'Additional description text below the label.'},
      {name: 'Icon', required: false, description: 'An optional icon within the input.'},
      {name: 'Placeholder', required: false, description: 'Placeholder text shown when the input is empty.'},
      {name: 'Spinner', required: false, description: 'Increment and decrement controls for the value.'},
    ],
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'NumberInput',
  displayName: 'Number Input',
  props: [
    {
      name: 'label',
      type: 'string',
      description:
        '输入框的标签文本（始终渲染以确保无障碍访问）。',
      required: true,
    },
    {
      name: 'value',
      type: 'number | null | undefined',
      description: '输入框的当前值。',
      required: true,
    },
    {
      name: 'onChange',
      type: '(value: number) => void',
      description:
        '输入值变化时触发的回调（仅在输入有效时触发）。',
      required: true,
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: '尺寸变体。',
      default: "'md'",
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description:
        '视觉隐藏标签（屏幕阅读器仍可访问）。',
    },
    {
      name: 'description',
      type: 'string',
      description: '显示在标签和输入框之间的描述文本。',
    },
    {
      name: 'isOptional',
      type: 'boolean',
      description:
        '字段是否可选（与 isRequired 互斥）。',
    },
    {
      name: 'isRequired',
      type: 'boolean',
      description:
        '字段是否必填（与 isOptional 互斥）。',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '输入框是否禁用。',
    },
    {
      name: 'placeholder',
      type: 'string',
      description: '占位符文本。',
    },
    {
      name: 'labelTooltip',
      type: 'string',
      description:
        '在标签末尾的信息图标中显示的工具提示文本。',
    },
    {
      name: 'startIcon',
      type: 'XDSIconType',
      description: '显示在输入框起始位置的图标。',
    },
    {
      name: 'labelIcon',
      type: 'XDSIconType',
      description: '显示在标签文本前的图标。',
    },
    {
      name: 'status',
      type: "{type: 'error' | 'warning' | 'success', message?: string}",
      description: '带可选消息的验证状态。',
    },
    {
      name: 'min',
      type: 'number | null',
      description: '允许的最小值。',
    },
    {
      name: 'max',
      type: 'number | null',
      description: '允许的最大值。',
    },
    {
      name: 'step',
      type: 'number | null',
      description: '输入框的步进增量。',
      default: '1',
    },
    {
      name: 'units',
      type: 'string | null',
      description:
        '在输入框末尾显示的单位文本（例如"%"或"GB"）。',
    },
    {
      name: 'isIntegerOnly',
      type: 'boolean',
      description: '仅允许整数值（不允许浮点数）。',
    },
    {
      name: 'hasClear',
      type: 'boolean',
      description: '输入有值时显示清除 (×) 按鈕。启用后， onChange 回调还接受 null 表示用户已清空输入。',
      default: 'false',
    },
    {
      name: 'htmlName',
      type: 'string',
      description: '用于表单提交的 HTML name 属性。',
    },
    {
      name: 'autoComplete',
      type: 'string',
      description: 'HTML autocomplete 属性。',
    },
    {
      name: 'hasAutoFocus',
      type: 'boolean',
      description: '是否在挂载时聚焦输入框。',
    },
    {
      name: 'onFocus',
      type: '(e: FocusEvent<HTMLInputElement>) => void',
      description: '输入框获得焦点时触发的回调。',
    },
    {
      name: 'onBlur',
      type: '(e: FocusEvent<HTMLInputElement>) => void',
      description: '输入框失去焦点时触发的回调。',
    },
    {
      name: 'onEnter',
      type: '() => void',
      description: '用户按下 Enter 键时触发的回调。',
    },
  ],
  theming: {
    targets: [
      {className: 'xds-number-input', visualProps: ['size', 'status']},
    ],
  },
  usage: {
    description:
      'A form input for numeric values with built-in validation, min/max constraints, and step controls. Use NumberInput for quantities, measurements, percentages, and similar inputs.',
    bestPractices: [
      { guidance: true, description: 'Set min, max, and step to guide users toward valid values.' },
      { guidance: true, description: 'Show units (e.g. "%" or "GB") so users know what the number represents.' },
      { guidance: false, description: 'Use NumberInput for free-form text that happens to contain numbers — use TextInput instead.' },
      { guidance: false, description: 'Set both isOptional and isRequired on the same field.' },
    ],
    anatomy: [
      {name: 'Label', required: true, description: 'The label for the number input.'},
      {name: 'Description', required: false, description: 'Additional description text below the label.'},
      {name: 'Icon', required: false, description: 'An optional icon within the input.'},
      {name: 'Placeholder', required: false, description: 'Placeholder text shown when the input is empty.'},
      {name: 'Spinner', required: false, description: 'Increment and decrement controls for the value.'},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'Number input component for collecting numeric user input w/ validation.',
  usage: {
    description:
      'A form input for numeric values with built-in validation, min/max constraints, and step controls. Use NumberInput for quantities, measurements, percentages, and similar inputs.',
    bestPractices: [
      { guidance: true, description: 'Set min, max, and step to guide users toward valid values.' },
      { guidance: true, description: 'Show units (e.g. "%" or "GB") so users know what the number represents.' },
      { guidance: false, description: 'Use NumberInput for free-form text that happens to contain numbers — use TextInput instead.' },
      { guidance: false, description: 'Set both isOptional and isRequired on the same field.' },
    ],
    anatomy: [
      {name: 'Label', required: true, description: 'The label for the number input.'},
      {name: 'Description', required: false, description: 'Additional description text below the label.'},
      {name: 'Icon', required: false, description: 'An optional icon within the input.'},
      {name: 'Placeholder', required: false, description: 'Placeholder text shown when the input is empty.'},
      {name: 'Spinner', required: false, description: 'Increment and decrement controls for the value.'},
    ],
  },
  propDescriptions: {
    label: 'Label text (always rendered for accessibility).',
    value: 'Current input value.',
    onChange: 'Callback on valid input change.',
    size: 'Size variant.',
    isLabelHidden: 'Visually hide label (still accessible to screen readers).',
    description: 'Text between label + input.',
    isOptional: 'Field optional (mutually exclusive w/ isRequired).',
    isRequired: 'Field required (mutually exclusive w/ isOptional).',
    isDisabled: 'Input disabled.',
    placeholder: 'Placeholder text.',
    labelTooltip: 'Tooltip text in info icon at label end.',
    startIcon: 'Icon at input start.',
    labelIcon: 'Icon before label text.',
    status: 'Validation status w/ optional message.',
    min: 'Minimum value allowed.',
    max: 'Maximum value allowed.',
    step: 'Step increment.',
    units: 'Units suffix (e.g. "%" or "GB").',
    isIntegerOnly: 'Only allow integer values.',
    hasClear: 'Shows clear button when input has value. onChange also accepts null on clear.',
    htmlName: 'HTML name for form submissions.',
    autoComplete: 'HTML autocomplete attribute.',
    hasAutoFocus: 'Focus input on mount.',
    onFocus: 'Callback on focus.',
    onBlur: 'Callback on blur.',
    onEnter: 'Callback on Enter key.',
  },
};
