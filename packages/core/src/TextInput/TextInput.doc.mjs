/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'TextInput',
  description:
    'A text input component for collecting user text input, with label, description, validation status, and optional/required indicators.',
  showcase: {
    aspectRatio: 4 / 3,
    code: '<XDSTextInput label="Name" value="" onChange={() => {}} />',
  },
  keywords: ["textinput","textfield","input","search","clearable","prefix","suffix","adornment","validation"],
  features: [
    'Label support — required label for accessibility (can be visually hidden)',
    'Description — optional text displayed between the label and input',
    'Optional/Required indicators — "Optional" or "Required" text with bullet separator',
    'Label tooltip — optional info icon with tooltip at the end of the label',
    'Validation status — error, warning, and success states with colored borders and icons',
    'Start icon — optional icon displayed at the start of the input',
    'Loading state — shows a spinner and sets aria-busy while an async action is pending',
    'Disabled state — visually dims the input and prevents interaction',
    'Accessible — label is always associated with the input via htmlFor/id; sets aria-invalid, aria-required, aria-busy, and aria-describedby as appropriate',
    'Styled with StyleX — uses XDS design tokens for consistent styling',
  ],  props: [
    {
      name: 'type',
      type: "'text' | 'password' | 'email'",
      description:
        'The HTML input type.',
      default: "'text'",
    },
    {
      name: 'label',
      type: 'string',
      description:
        'Label text for the input — always rendered for accessibility.',
      required: true,
    },
    {
      name: 'value',
      type: 'string',
      description: 'Current value of the input.',
      required: true,
    },
    {
      name: 'onChange',
      type: '(value: string, e: ChangeEvent<HTMLInputElement>) => void',
      description: 'Callback fired when the input value changes.',
    },
    {
      name: 'onChangeAction',
      type: '(value: string, e: ChangeEvent<HTMLInputElement>) => void | Promise<void>',
      description:
        'Async action fired after onChange (if not prevented). Triggers optimistic update and shows a loading spinner while pending.',
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: 'Size variant of the input.',
      default: "'md'",
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description:
        'Visually hides the label while keeping it accessible to screen readers.',
      default: 'false',
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
        'Displays an "Optional" indicator next to the label. Mutually exclusive with isRequired.',
      default: 'false',
    },
    {
      name: 'isRequired',
      type: 'boolean',
      description:
        'Displays a "Required" indicator next to the label and sets aria-required. Mutually exclusive with isOptional.',
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description:
        'Disables the input, preventing interaction and dimming the element.',
      default: 'false',
    },
    {
      name: 'isLoading',
      type: 'boolean',
      description:
        'Puts the input in a loading state, showing a spinner and setting aria-busy.',
      default: 'false',
    },
    {
      name: 'placeholder',
      type: 'string',
      description: 'Placeholder text shown when the input is empty.',
    },
    {
      name: 'labelTooltip',
      type: 'string',
      description:
        'Tooltip text displayed in an info icon at the end of the label.',
    },
    {
      name: 'startIcon',
      type: 'XDSIconType',
      description:
        'SVG icon component displayed at the start of the input (e.g. from heroicons or lucide).',
    },
    {
      name: 'status',
      type: "{type: 'error' | 'warning' | 'success', message?: string}",
      description:
        'Validation status — applies a colored border and status icon. If message is provided, displays a floating message below the input. Error type also sets aria-invalid.',
    },
    {
      name: 'hasClear',
      type: 'boolean',
      description:
        'Shows a clear (\u00d7) button when the input has a value. Clicking it clears the value and returns focus to the input.',
      default: 'false',
    },
    {
      name: 'hasAutoFocus',
      type: 'boolean',
      description: 'Automatically focuses the input on mount.',
      default: 'false',
    },
    {
      name: 'htmlName',
      type: 'string',
      description:
        'The HTML name attribute for the input, useful for form submissions.',
    },
  ],
  theming: {
    targets: [
      {className: 'xds-text-input', visualProps: ['size']},
    ],
  },
  accessibility: [
    'Label is always rendered and associated with the input via htmlFor/id (using useId). Use isLabelHidden to hide it visually while keeping it accessible to screen readers.',
    'aria-describedby is set automatically when description or a status message is present.',
    'aria-invalid="true" is set when status.type is "error".',
    'aria-required="true" is set when isRequired is true.',
    'aria-busy is set while an optimistic update or isLoading is active.',
  ],
  notes: [
    'isOptional and isRequired are mutually exclusive — if both are set, "Optional" is shown.',
    'onChangeAction fires after onChange inside a React transition, enabling useOptimistic for an instant UI update while the async work completes.',
    'The component wraps XDSField for label, description, and optional/required rendering.',
    'The size prop supports "sm", "md", and "lg".',
  ],
  usage: {
    summary: 'Enables users to enter or edit text or numeric values.',
    content: `## When to use

- Short-form and long-form text entries.

## Best practices

- Do: Size the input to reflect the expected content length.
- Do: Use validation messaging for required fields.
- Validation states: error (blocking), warning (non-blocking), success (confirmation).`,
    anatomy: [
      {name: 'Label', required: true, description: 'Text that identifies the input field.'},
      {name: 'Description', required: false, description: 'Helper text providing additional context.'},
      {name: 'Icon', required: false, description: '16px icon displayed inside the input.'},
      {name: 'Placeholder', required: false, description: 'Hint text shown when the input is empty.'},
      {name: 'Spinner', required: false, description: 'Loading indicator for pending actions.'},
    ],
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'TextInput',
  description:
    '用于收集用户文本输入的文本输入组件，带有标签、描述、验证状态和可选/必填指示器。',
  features: [
    '标签支持 — 必需的无障碍标签（可视觉隐藏）',
    '描述 — 显示在标签和输入框之间的可选文本',
    '可选/必填指示器 — 带圆点分隔符的"可选"或"必填"文本',
    '标签工具提示 — 标签末尾带工具提示的可选信息图标',
    '验证状态 — 错误、警告和成功状态，带彩色边框和图标',
    '起始图标 — 显示在输入框起始位置的可选图标',
    '加载状态 — 异步操作挂起时显示旋转器并设置 aria-busy',
    '禁用状态 — 视觉上使输入框变暗并阻止交互',
    '无障碍 — 标签始终通过 htmlFor/id 与输入框关联；根据需要设置 aria-invalid、aria-required、aria-busy 和 aria-describedby',
    '使用 StyleX 样式化 — 使用 XDS 设计令牌实现一致的样式',
  ],
  props: [
    {
      name: 'type',
      type: "'text' | 'password' | 'email'",
      description: 'HTML 输入框类型。',
      default: "'text'",
    },
    {
      name: 'label',
      type: 'string',
      description:
        '输入框的标签文本 — 始终渲染以确保无障碍性。',
      required: true,
    },
    {
      name: 'value',
      type: 'string',
      description: '输入框的当前值。',
      required: true,
    },
    {
      name: 'onChange',
      type: '(value: string, e: ChangeEvent<HTMLInputElement>) => void',
      description: '输入框值变化时触发的回调。',
    },
    {
      name: 'onChangeAction',
      type: '(value: string, e: ChangeEvent<HTMLInputElement>) => void | Promise<void>',
      description:
        '在 onChange 之后（如果未被阻止）触发的异步操作。触发乐观更新并在挂起时显示加载旋转器。',
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: '输入框的尺寸变体。',
      default: "'md'",
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description:
        '视觉上隐藏标签，同时保持屏幕阅读器的无障碍性。',
      default: 'false',
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
        '在标签旁显示"可选"指示器。与 isRequired 互斥。',
      default: 'false',
    },
    {
      name: 'isRequired',
      type: 'boolean',
      description:
        '在标签旁显示"必填"指示器并设置 aria-required。与 isOptional 互斥。',
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description:
        '禁用输入框，阻止交互并使元素变暗。',
      default: 'false',
    },
    {
      name: 'isLoading',
      type: 'boolean',
      description:
        '使输入框进入加载状态，显示旋转器并设置 aria-busy。',
      default: 'false',
    },
    {
      name: 'placeholder',
      type: 'string',
      description: '输入框为空时显示的占位符文本。',
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
      description:
        '显示在输入框起始位置的 SVG 图标组件（例如来自 heroicons 或 lucide）。',
    },
    {
      name: 'status',
      type: "{type: 'error' | 'warning' | 'success', message?: string}",
      description:
        '验证状态 — 应用彩色边框和状态图标。如果提供了 message，在输入框下方显示浮动消息。错误类型还会设置 aria-invalid。',
    },
    {
      name: 'hasClear',
      type: 'boolean',
      description: '输入有值时显示清除 (×) 按鈕。点击后清空值并将焦点返回输入框。',
      default: 'false',
    },
    {
      name: 'hasAutoFocus',
      type: 'boolean',
      description: '挂载时自动聚焦输入框。',
      default: 'false',
    },
    {
      name: 'htmlName',
      type: 'string',
      description:
        '输入框的 HTML name 属性，用于表单提交。',
    },
  ],
  theming: {
    targets: [
      {className: 'xds-text-input', visualProps: ['size']},
    ],
  },
  accessibility: [
    '标签始终渲染并通过 htmlFor/id（使用 useId）与输入框关联。使用 isLabelHidden 视觉上隐藏它，同时保持屏幕阅读器的无障碍性。',
    '当描述或状态消息存在时，自动设置 aria-describedby。',
    '当 status.type 为 "error" 时，设置 aria-invalid="true"。',
    '当 isRequired 为 true 时，设置 aria-required="true"。',
    '乐观更新或 isLoading 活跃期间设置 aria-busy。',
  ],
  notes: [
    'isOptional 和 isRequired 互斥 — 如果同时设置，显示"可选"。',
    'onChangeAction 在 React transition 内于 onChange 之后触发，启用 useOptimistic 以在异步工作完成时实现即时 UI 更新。',
    '组件包装 XDSField 以实现标签、描述和可选/必填的渲染。',
    'size 属性支持 "sm"、"md" 和 "lg"。',
  ],
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'Text input for collecting user text w/ label, description, validation status, optional/required indicators.',
  features: [
    'Label support; required for a11y (can be visually hidden)',
    'Description; optional text between label+input',
    'Optional/Required indicators; "Optional" or "Required" text w/ bullet separator',
    'Label tooltip; optional info icon w/ tooltip at label end',
    'Validation status; error, warning, success states w/ colored borders+icons',
    'Start icon; optional icon at input start',
    'Loading state; shows spinner+sets aria-busy while async action pending',
    'Disabled state; dims input, prevents interaction',
    'Accessible; label always associated via htmlFor/id; sets aria-invalid, aria-required, aria-busy, aria-describedby',
    'Styled w/ StyleX; uses XDS design tokens for consistent styling',
  ],
  notes: [
    'isOptional+isRequired mutually exclusive; both set = "Optional" shown.',
    'onChangeAction fires after onChange in React transition, enables useOptimistic for instant UI update.',
    'Wraps XDSField for label, description, optional/required rendering.',
    'size supports "sm", "md", "lg".',
  ],
  accessibility: [
    'Label always rendered+associated via htmlFor/id (useId). isLabelHidden hides visually, keeps screen reader access.',
    'aria-describedby auto-set when description or status message present.',
    'aria-invalid="true" when status.type is "error".',
    'aria-required="true" when isRequired is true.',
    'aria-busy set during optimistic update or isLoading.',
  ],
  propDescriptions: {
    type: 'HTML input type.',
    label: 'Label text for input; always rendered for a11y.',
    value: 'Current input value.',
    onChange: 'Fired on input value change.',
    onChangeAction: 'Async action after onChange (if not prevented). Triggers optimistic update+spinner while pending.',
    size: 'Size variant of input.',
    isLabelHidden: 'Visually hides label; keeps screen reader access.',
    description: 'Description text between label+input.',
    isOptional: 'Shows "Optional" indicator. Mutually exclusive w/ isRequired.',
    isRequired: 'Shows "Required" indicator+sets aria-required. Mutually exclusive w/ isOptional.',
    isDisabled: 'Disables input, prevents interaction, dims element.',
    isLoading: 'Loading state w/ spinner+aria-busy.',
    placeholder: 'Placeholder when input empty.',
    labelTooltip: 'Tooltip in info icon at label end.',
    startIcon: 'SVG icon at input start (e.g. heroicons or lucide).',
    status: 'Validation status; colored border+icon. Message floats below. Error sets aria-invalid.',
    hasClear: 'Shows clear button when input has value. Clears value on click.',
    hasAutoFocus: 'Auto-focus input on mount.',
    htmlName: 'HTML name attr for form submissions.',
  },
};
