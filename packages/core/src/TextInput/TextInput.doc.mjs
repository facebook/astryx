/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'TextInput',
  keywords: ["textinput","textfield","input","search","clearable","prefix","suffix","adornment","validation"],
  props: [
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
      name: 'changeAction',
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
        'SVG icon component displayed at the start of the input. See `npx xds docs icons` for valid semantic names.',
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
      {className: 'xds-text-input', visualProps: ['size', 'status']},
    ],
  },
  usage: {
    description:
      'TextInput collects short-form text like names, emails, or search queries. Use it for single-line values where the expected input is brief. Pair it with validation status to guide users through required or formatted fields.',
    bestPractices: [
      {guidance: true, description: 'Always provide a visible label so users know what the field is for. Only hide the label when surrounding context makes it obvious, like a search bar with a magnifying-glass icon.'},
      {guidance: true, description: 'Use validation status with a message to explain what went wrong — "Email must include @" is better than just turning the border red.'},
      {guidance: true, description: 'Size the input to match the expected content length so users can gauge how much to type — small for zip codes, medium for names, large for URLs.'},
      {guidance: true, description: 'Add a clear button for search and filter inputs so users can quickly reset without selecting all text.'},
      {guidance: false, description: "Don't use placeholder text as a replacement for a label — placeholders disappear on focus and are not reliably read by screen readers."},
      {guidance: false, description: "Don't use TextInput for multi-line content like comments or descriptions — use TextArea instead."},
      {guidance: false, description: "Don't mark every field as required — only flag truly mandatory fields so users are not overwhelmed by validation errors."},
    ],
    anatomy: [
      {name: 'Label', required: true, description: 'Text that identifies the field. Always rendered for accessibility even when visually hidden.'},
      {name: 'Description', required: false, description: 'Helper text between the label and the input that provides additional context or formatting hints.'},
      {name: 'Start icon', required: false, description: 'A leading icon inside the input that hints at the expected content, like a magnifying glass for search.'},
      {name: 'Placeholder', required: false, description: 'Hint text shown when the input is empty. Disappears on focus.'},
      {name: 'Clear button', required: false, description: 'A trailing × button that resets the value and returns focus to the input.'},
      {name: 'Spinner', required: false, description: 'Loading indicator that appears during async actions like server-side validation.'},
      {name: 'Status icon', required: false, description: 'A trailing icon (error, warning, or success) that communicates validation state.'},
    ],
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'TextInput',
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
      name: 'changeAction',
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
      {className: 'xds-text-input', visualProps: ['size', 'status']},
    ],
  },
  usage: {
    description:
      'TextInput collects short-form text like names, emails, or search queries. Use it for single-line values where the expected input is brief. Pair it with validation status to guide users through required or formatted fields.',
    bestPractices: [
      {guidance: true, description: 'Always provide a visible label so users know what the field is for. Only hide the label when surrounding context makes it obvious, like a search bar with a magnifying-glass icon.'},
      {guidance: true, description: 'Use validation status with a message to explain what went wrong — "Email must include @" is better than just turning the border red.'},
      {guidance: true, description: 'Size the input to match the expected content length so users can gauge how much to type — small for zip codes, medium for names, large for URLs.'},
      {guidance: true, description: 'Add a clear button for search and filter inputs so users can quickly reset without selecting all text.'},
      {guidance: false, description: "Don't use placeholder text as a replacement for a label — placeholders disappear on focus and are not reliably read by screen readers."},
      {guidance: false, description: "Don't use TextInput for multi-line content like comments or descriptions — use TextArea instead."},
      {guidance: false, description: "Don't mark every field as required — only flag truly mandatory fields so users are not overwhelmed by validation errors."},
    ],
    anatomy: [
      {name: 'Label', required: true, description: 'Text that identifies the field. Always rendered for accessibility even when visually hidden.'},
      {name: 'Description', required: false, description: 'Helper text between the label and the input that provides additional context or formatting hints.'},
      {name: 'Start icon', required: false, description: 'A leading icon inside the input that hints at the expected content, like a magnifying glass for search.'},
      {name: 'Placeholder', required: false, description: 'Hint text shown when the input is empty. Disappears on focus.'},
      {name: 'Clear button', required: false, description: 'A trailing × button that resets the value and returns focus to the input.'},
      {name: 'Spinner', required: false, description: 'Loading indicator that appears during async actions like server-side validation.'},
      {name: 'Status icon', required: false, description: 'A trailing icon (error, warning, or success) that communicates validation state.'},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'Text input for collecting user text w/ label, description, validation status, optional/required indicators.',
  usage: {
    description:
      'TextInput collects short-form text like names, emails, or search queries. Use it for single-line values where the expected input is brief. Pair it with validation status to guide users through required or formatted fields.',
    bestPractices: [
      {guidance: true, description: 'Always provide a visible label so users know what the field is for. Only hide the label when surrounding context makes it obvious, like a search bar with a magnifying-glass icon.'},
      {guidance: true, description: 'Use validation status with a message to explain what went wrong — "Email must include @" is better than just turning the border red.'},
      {guidance: true, description: 'Size the input to match the expected content length so users can gauge how much to type — small for zip codes, medium for names, large for URLs.'},
      {guidance: true, description: 'Add a clear button for search and filter inputs so users can quickly reset without selecting all text.'},
      {guidance: false, description: "Don't use placeholder text as a replacement for a label — placeholders disappear on focus and are not reliably read by screen readers."},
      {guidance: false, description: "Don't use TextInput for multi-line content like comments or descriptions — use TextArea instead."},
      {guidance: false, description: "Don't mark every field as required — only flag truly mandatory fields so users are not overwhelmed by validation errors."},
    ],
    anatomy: [
      {name: 'Label', required: true, description: 'Text that identifies the field. Always rendered for accessibility even when visually hidden.'},
      {name: 'Description', required: false, description: 'Helper text between the label and the input that provides additional context or formatting hints.'},
      {name: 'Start icon', required: false, description: 'A leading icon inside the input that hints at the expected content, like a magnifying glass for search.'},
      {name: 'Placeholder', required: false, description: 'Hint text shown when the input is empty. Disappears on focus.'},
      {name: 'Clear button', required: false, description: 'A trailing × button that resets the value and returns focus to the input.'},
      {name: 'Spinner', required: false, description: 'Loading indicator that appears during async actions like server-side validation.'},
      {name: 'Status icon', required: false, description: 'A trailing icon (error, warning, or success) that communicates validation state.'},
    ],
  },
  propDescriptions: {
    type: 'HTML input type.',
    label: 'Label text for input; always rendered for a11y.',
    value: 'Current input value.',
    onChange: 'Fired on input value change.',
    changeAction: 'Async action after onChange (if not prevented). Triggers optimistic update+spinner while pending.',
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
