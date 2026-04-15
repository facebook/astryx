/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'NumberInput',
  description:
    'A number input component for collecting numeric user input with validation.',
  showcase: {
    aspectRatio: 4 / 3,
    code: '<XDSNumberInput label="Amount" value={0} onChange={() => {}} />',
  },
  keywords: ["numberinput","numberfield","stepper","spinner","counter","increment","decrement","quantity","numberpicker"],
  features: [
    'Label Support — required label for accessibility (can be visually hidden)',
    'Description — optional description text displayed between the label and input',
    'Optional/Required Indicators — display "Optional" or "Required" text with bullet separator',
    'Label Tooltip — optional info icon with tooltip at end of label',
    'Label Icon — optional icon before the label text',
    'Accessible — label properly associated with input via htmlFor/id',
    'Styled with StyleX — uses XDS design tokens for consistent styling',
    'Size Variants — three sizes (sm, md, lg) for different contexts',
    'Status Handling — error, warning, and success states with messages',
    'Number Constraints — support for min, max, and step attributes',
    'Validated onChange — only calls onChange when the entered value passes validation',
    'Units Display — optional units suffix (e.g., "%" or "GB")',
    'Integer Mode — option to restrict to integers only',
    'Native Controls — uses type="number" for browser step controls',
    'Event Callbacks — onFocus, onBlur, and onEnter handlers',
  ],
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
      description: 'Icon to display at the start of the input.',
    },
    {
      name: 'labelIcon',
      type: 'XDSIconType',
      description: 'Icon to display before the label text.',
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
      {className: 'xds-number-input', visualProps: ['size']},
    ],
  },
  accessibility: [
    'Label is always rendered and associated with the input via htmlFor/id using the useId hook.',
    'Use isLabelHidden to hide the label visually while keeping it accessible to screen readers via a CSS technique.',
    'Wraps XDSField for consistent label, description, and optional/required indicator handling.',
  ],
  notes: [
    'isOptional and isRequired are mutually exclusive; if both are set, "Optional" is shown.',
    'Uses type="number" to enable native browser step controls (up/down arrows).',
    'Validated onChange: only calls onChange when the entered value is a valid number that passes min/max/integer constraints.',
    'Uses internal pending state to allow free-form typing while validating on commit.',
    'Units are displayed as a lighter grey suffix after the input value.',
  ],
  usage: {
    summary: 'Enables users to enter or edit numeric values with validation support.',
    content: `## When to use

- Numeric input within forms.

## Best practices

- Size the input to reflect expected content length.
- Validation states: error (blocking), warning (non-blocking), success (confirmation).`,
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
  description:
    '用于收集带验证的数字用户输入的数字输入组件。',
  features: [
    '标签支持 - 必需的标签用于无障碍访问（可视觉隐藏）',
    '描述 - 可选的描述文本，显示在标签和输入框之间',
    '可选/必填指示器 - 显示"Optional"或"Required"文本，带圆点分隔符',
    '标签工具提示 - 可选的信息图标，在标签末尾显示工具提示',
    '标签图标 - 可选的标签文本前图标',
    '无障碍 - 通过 htmlFor/id 将标签与输入框正确关联',
    '使用 StyleX 样式 - 使用 XDS 设计令牌实现一致的样式',
    '尺寸变体 - 三种尺寸（sm、md、lg）适用于不同场景',
    '状态处理 - 错误、警告和成功状态及消息',
    '数值约束 - 支持 min、max 和 step 属性',
    '验证性 onChange - 仅在输入值通过验证时调用 onChange',
    '单位显示 - 可选的单位后缀（例如"%"或"GB"）',
    '整数模式 - 可选择仅限整数输入',
    '原生控件 - 使用 type="number" 获取浏览器步进控件',
    '事件回调 - onFocus、onBlur 和 onEnter 处理器',
  ],
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
      {className: 'xds-number-input', visualProps: ['size']},
    ],
  },
  accessibility: [
    '标签始终渲染，并通过 useId hook 使用 htmlFor/id 与输入框关联。',
    '使用 isLabelHidden 视觉隐藏标签，同时通过 CSS 技术保持屏幕阅读器可访问。',
    '包装 XDSField 以实现一致的标签、描述和可选/必填指示器处理。',
  ],
  notes: [
    'isOptional 和 isRequired 互斥；同时设置两者将显示"Optional"。',
    '使用 type="number" 启用浏览器原生步进控件（上/下箭头）。',
    '验证性 onChange：仅在输入值为通过 min/max/整数约束的有效数字时调用 onChange。',
    '使用内部待定状态以允许自由输入，同时在提交时进行验证。',
    '单位以浅灰色后缀显示在输入值之后。',
  ],
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'Number input component for collecting numeric user input w/ validation.',
  features: [
    'Label support; required label for accessibility (can be visually hidden)',
    'Description; optional text between label + input',
    'Optional/Required indicators; display "Optional" or "Required" w/ bullet separator',
    'Label tooltip; optional info icon w/ tooltip at label end',
    'Label icon; optional icon before label text',
    'Accessible; label associated w/ input via htmlFor/id',
    'Styled w/ StyleX; uses XDS design tokens for consistent styling',
    'Size variants; three sizes (sm, md, lg) for different contexts',
    'Status handling; error, warning, success states w/ messages',
    'Number constraints; support for min, max, step attributes',
    'Validated onChange; only calls onChange when value passes validation',
    'Units display; optional units suffix (e.g. "%" or "GB")',
    'Integer mode; option to restrict to integers only',
    'Native controls; uses type="number" for browser step controls',
    'Event callbacks; onFocus, onBlur, onEnter handlers',
  ],
  accessibility: [
    'Label always rendered + associated w/ input via htmlFor/id using useId hook.',
    'Use isLabelHidden to hide label visually while keeping screen reader access via CSS.',
    'Wraps XDSField for consistent label, description, optional/required indicator handling.',
  ],
  notes: [
    'isOptional + isRequired mutually exclusive; both set shows "Optional".',
    'Uses type="number" to enable native browser step controls (up/down arrows).',
    'Validated onChange: only calls onChange when value is valid number passing min/max/integer constraints.',
    'Uses internal pending state for free-form typing while validating on commit.',
    'Units displayed as lighter grey suffix after input value.',
  ],
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
