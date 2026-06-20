// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'TextArea',
  displayName: 'Text Area',
  category: 'Data Input',
  keywords: ["textarea","textfield","multiline","comment","message","autoresize","autosize","charlimit"],
  props: [
    {
      name: 'ref',
      type: 'React.Ref<HTMLTextAreaElement>',
      description:
        'Ref forwarded to the underlying <textarea> element.',
    },
    {
      name: 'label',
      type: 'string',
      description:
        'Label text for the textarea. Always rendered for accessibility.',
      required: true,
    },
    {
      name: 'value',
      type: 'string',
      description: 'Current value of the textarea.',
      required: true,
    },
    {
      name: 'onChange',
      type: '(value: string, e: ChangeEvent<HTMLTextAreaElement>) => void',
      description: 'Callback fired when the textarea value changes.',
    },
    {
      name: 'changeAction',
      type: '(value: string, e: ChangeEvent<HTMLTextAreaElement>) => void | Promise<void>',
      description:
        'Async action fired after onChange inside a React transition. Enables optimistic updates via useOptimistic.',
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
      description: 'Helper text displayed between the label and textarea.',
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
      description: 'Disables the textarea, preventing interaction.',
      default: 'false',
    },
    {
      name: 'isLoading',
      type: 'boolean',
      description:
        'Puts the textarea in a loading state, showing a spinner inside the input.',
      default: 'false',
    },
    {
      name: 'placeholder',
      type: 'string',
      description: 'Placeholder text shown when the textarea is empty.',
    },
    {
      name: 'rows',
      type: 'number',
      description: 'Number of visible text rows.',
      default: '3',
    },
    {
      name: 'maxLength',
      type: 'number',
      description:
        'Maximum number of characters allowed. When set, a character counter (current/max) is displayed below the textarea. Does not enforce the limit natively; the counter shows error styling when exceeded.',
    },
    {
      name: 'status',
      type: "{ type: 'warning' | 'error' | 'success'; message?: string }",
      description:
        'Status indicator that applies a colored border and icon. An optional message is displayed in a floating box below the textarea.',
    },
    {
      name: 'labelTooltip',
      type: 'string',
      description:
        'Tooltip text displayed in an info icon at the end of the label.',
    },
    {
      name: 'startIcon',
      type: 'IconType',
      description:
        'Icon component rendered inside the leading edge of the textarea wrapper. See `npx astryx docs icons` for valid semantic names.',
    },
    {
      name: 'hasSpellCheck',
      type: 'boolean',
      description: 'Enables or disables browser spell checking.',
      default: 'true',
    },
    {
      name: 'hasAutoFocus',
      type: 'boolean',
      description: 'Automatically focuses the textarea on mount.',
      default: 'false',
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: 'Size of the textarea, affecting internal padding. Height is controlled by rows, not size.',
      default: "'md'",
    },
    {
      name: 'onPaste',
      type: '(e: ClipboardEvent<HTMLTextAreaElement>) => void',
      description: 'Callback fired when content is pasted into the textarea.',
    },
    {
      name: 'htmlName',
      type: 'string',
      description:
        'HTML name attribute for the textarea element, useful for form submissions.',
    },
    {
      name: 'onFocus',
      type: '(e: FocusEvent<HTMLTextAreaElement>) => void',
      description: 'Callback fired when the textarea receives focus.',
    },
    {
      name: 'onBlur',
      type: '(e: FocusEvent<HTMLTextAreaElement>) => void',
      description: 'Callback fired when the textarea loses focus.',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value, not an inline style object like style={{}}.',
    },
  ],
  theming: {
    targets: [
      {className: 'xds-textarea', visualProps: ['size', 'status']},
    ],
  },
  usage: {
    description:
      'TextArea is a multi-line text input for collecting longer-form content like comments, descriptions, or messages. Use it when the expected input spans multiple lines. For shorter, single-line values, use TextInput.',
    bestPractices: [
      { guidance: true, description: 'Provide a visible label so users know what to enter. If the label must be hidden, set isLabelHidden with a descriptive label for screen readers.' },
      { guidance: true, description: 'Set maxLength with a character counter when there is a defined limit; it helps users stay within bounds before they submit.' },
      { guidance: true, description: 'Use the status prop to surface validation feedback inline: show success when input is valid, warning for soft limits, and error for hard failures.' },
      { guidance: true, description: 'Add a description or placeholder to clarify expected content, like "Describe the issue in detail," but never rely on placeholder alone as the only label.' },
      { guidance: false, description: 'Avoid using TextArea for short, single-line values like names or emails; use TextInput instead.' },
      { guidance: false, description: 'Don\'t rely solely on placeholder text to communicate the purpose of the field; placeholders disappear on focus and are not accessible labels.' },
      { guidance: false, description: 'Don\'t show a status message without also setting the status type; the colored border and icon are what draw the user\'s attention to the message.' },
    ],
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'TextArea',
  displayName: 'Text Area',
  props: [
    {
      name: 'ref',
      type: 'React.Ref<HTMLTextAreaElement>',
      description: '转发至底层 <textarea> 元素的 ref。',
    },
    {
      name: 'label',
      type: 'string',
      description: '文本域的标签文本：始终渲染以确保无障碍性。',
      required: true,
    },
    {
      name: 'value',
      type: 'string',
      description: '文本域的当前值。',
      required: true,
    },
    {
      name: 'onChange',
      type: '(value: string, e: ChangeEvent<HTMLTextAreaElement>) => void',
      description: '文本域值变化时触发的回调。',
    },
    {
      name: 'changeAction',
      type: '(value: string, e: ChangeEvent<HTMLTextAreaElement>) => void | Promise<void>',
      description: '在 React transition 内于 onChange 之后触发的异步操作。通过 useOptimistic 启用乐观更新。',
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description: '视觉上隐藏标签，同时保持屏幕阅读器的无障碍性。',
      default: 'false',
    },
    {
      name: 'description',
      type: 'string',
      description: '显示在标签和文本域之间的辅助文本。',
    },
    {
      name: 'isOptional',
      type: 'boolean',
      description: '在标签旁显示"可选"指示器。与 isRequired 互斥。',
      default: 'false',
    },
    {
      name: 'isRequired',
      type: 'boolean',
      description: '在标签旁显示"必填"指示器并设置 aria-required。与 isOptional 互斥。',
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '禁用文本域，阻止交互。',
      default: 'false',
    },
    {
      name: 'isLoading',
      type: 'boolean',
      description: '使文本域进入加载状态，在输入框内显示旋转器。',
      default: 'false',
    },
    {
      name: 'placeholder',
      type: 'string',
      description: '文本域为空时显示的占位符文本。',
    },
    {
      name: 'rows',
      type: 'number',
      description: '可见文本行数。',
      default: '3',
    },
    {
      name: 'maxLength',
      type: 'number',
      description: '允许的最大字符数。设置后，在文本域下方显示字符计数器（当前/最大）。不原生强制限制：超出时计数器显示错误样式。',
    },
    {
      name: 'status',
      type: "{ type: 'warning' | 'error' | 'success'; message?: string }",
      description: '应用彩色边框和图标的状态指示器。可选消息显示在文本域下方的浮动框中。',
    },
    {
      name: 'labelTooltip',
      type: 'string',
      description: '在标签末尾的信息图标中显示的工具提示文本。',
    },
    {
      name: 'startIcon',
      type: 'IconType',
      description: '在文本域包装器前端内部渲染的图标组件。',
    },
    {
      name: 'hasSpellCheck',
      type: 'boolean',
      description: '启用或禁用浏览器拼写检查。',
      default: 'true',
    },
    {
      name: 'hasAutoFocus',
      type: 'boolean',
      description: '挂载时自动聚焦文本域。',
      default: 'false',
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: '文本域的尺寸，影响内部填充。高度由 rows 控制，而非 size。',
      default: "'md'",
    },
    {
      name: 'onPaste',
      type: '(e: ClipboardEvent<HTMLTextAreaElement>) => void',
      description: '内容粘贴到文本域时触发的回调。',
    },
    {
      name: 'htmlName',
      type: 'string',
      description: '文本域元素的 HTML name 属性，用于表单提交。',
    },
    {
      name: 'onFocus',
      type: '(e: FocusEvent<HTMLTextAreaElement>) => void',
      description: '文本域获得焦点时触发的回调。',
    },
    {
      name: 'onBlur',
      type: '(e: FocusEvent<HTMLTextAreaElement>) => void',
      description: '文本域失去焦点时触发的回调。',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: 'StyleX 样式，用于布局自定义（边距、定位、尺寸）。必须是 stylex.create() 的值，而非内联样式对象。',
    },
  ],
  theming: {
    targets: [
      {className: 'xds-textarea', visualProps: ['size', 'status']},
    ],
  },
  usage: {
    description:
      'TextArea is a multi-line text input for collecting longer-form content like comments, descriptions, or messages. Use it when the expected input spans multiple lines. For shorter, single-line values, use TextInput.',
    bestPractices: [
      { guidance: true, description: 'Provide a visible label so users know what to enter. If the label must be hidden, set isLabelHidden with a descriptive label for screen readers.' },
      { guidance: true, description: 'Set maxLength with a character counter when there is a defined limit; it helps users stay within bounds before they submit.' },
      { guidance: true, description: 'Use the status prop to surface validation feedback inline: show success when input is valid, warning for soft limits, and error for hard failures.' },
      { guidance: true, description: 'Add a description or placeholder to clarify expected content, like "Describe the issue in detail," but never rely on placeholder alone as the only label.' },
      { guidance: false, description: 'Avoid using TextArea for short, single-line values like names or emails; use TextInput instead.' },
      { guidance: false, description: 'Don\'t rely solely on placeholder text to communicate the purpose of the field; placeholders disappear on focus and are not accessible labels.' },
      { guidance: false, description: 'Don\'t show a status message without also setting the status type; the colored border and icon are what draw the user\'s attention to the message.' },
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'Multi-line text input for collecting longer user input.',
  usage: {
    description:
      'Multi-line input for comments, descriptions, messages. Use when input spans multiple lines; use TextInput for single-line.',
    bestPractices: [
      { guidance: true, description: 'Visible label or isLabelHidden with descriptive label for screen readers.' },
      { guidance: true, description: 'Set maxLength for character counter when a limit exists.' },
      { guidance: true, description: 'Use status prop for inline validation: success, warning, error.' },
      { guidance: true, description: 'Add description or placeholder for context; never placeholder alone as label.' },
      { guidance: false, description: 'Avoid TextArea for single-line values; use TextInput.' },
      { guidance: false, description: 'Don\'t use placeholder as only label; disappears on focus, not accessible.' },
      { guidance: false, description: 'Don\'t show status message without status type; border and icon draw attention.' },
    ],
  },
  propDescriptions: {
    ref: 'ref forwarded to underlying <textarea>.',
    label: 'Label text for textarea; always rendered for a11y.',
    value: 'Current textarea value.',
    onChange: 'Fired on textarea value change.',
    changeAction: 'Async action after onChange in React transition. Enables useOptimistic.',
    isLabelHidden: 'Visually hides label; keeps screen reader access.',
    description: 'Helper text between label+textarea.',
    isOptional: 'Shows "Optional" indicator. Mutually exclusive w/ isRequired.',
    isRequired: 'Shows "Required" indicator+sets aria-required. Mutually exclusive w/ isOptional.',
    isDisabled: 'Disables textarea, prevents interaction.',
    isLoading: 'Loading state w/ spinner inside input.',
    placeholder: 'Placeholder when textarea empty.',
    rows: 'Visible text rows.',
    maxLength: 'Max chars allowed. Shows counter (current/max) below textarea. No native enforcement.',
    status: 'Colored border+icon status. Optional floating message below textarea.',
    labelTooltip: 'Tooltip in info icon at label end.',
    startIcon: 'Icon inside leading edge of textarea wrapper.',
    hasSpellCheck: 'Enables/disables browser spell checking.',
    hasAutoFocus: 'Auto-focus textarea on mount.',
    size: 'Textarea size; affects internal padding. Height controlled by rows.',
    onPaste: 'Fired on paste into textarea.',
    htmlName: 'HTML name attr for form submissions.',
    onFocus: 'Callback on focus.',
    onBlur: 'Callback on blur.',
    xstyle: 'StyleX styles for layout customization. Must be stylex.create() value, not inline style.',
  },
};
