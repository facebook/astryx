/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'TextArea',
  description:
    'A multi-line text input component for collecting longer user input.',
  showcase: {
    aspectRatio: 4 / 3,
    code: '<XDSTextArea label="Description" value="" onChange={() => {}} />',
  },
  keywords: ["textarea","textfield","multiline","comment","message","autoresize","autosize","charlimit"],
  features: [
    'Label support — required label for accessibility, can be visually hidden',
    'Description — optional text displayed between the label and textarea',
    'Optional/Required indicators — displays "Optional" or "Required" text with bullet separator',
    'Status variants — warning, error, and success states with colored borders and icons',
    'Character counter — displays current/max length when maxLength is set (does not enforce natively)',
    'Start icon — optional icon rendered inside the leading edge of the input',
    'Label tooltip — optional info icon with tooltip at the end of the label',
    'Loading state — shows a spinner and uses optimistic updates via useOptimistic',
    'Async action support — onChangeAction fires after onChange inside a React transition',
    'Disabled state — visual opacity and cursor changes, no interaction',
    'Accessible — label associated via htmlFor/id, aria-describedby, aria-required, aria-invalid, aria-busy',
    'Resizable — vertical resize enabled by default',
    'Spell check — browser spell checking enabled by default, configurable',
    'Reduced motion — respects prefers-reduced-motion for input wrapper transitions',
  ],  props: [
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
        'Label text for the textarea — always rendered for accessibility.',
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
      name: 'onChangeAction',
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
        'Maximum number of characters allowed. When set, a character counter (current/max) is displayed below the textarea. Does not enforce the limit natively — the counter shows error styling when exceeded.',
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
      type: 'XDSIconType',
      description:
        'Icon component rendered inside the leading edge of the textarea wrapper.',
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
        'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value — not an inline style object like style={{}}.',
    },
  ],
  theming: {
    targets: [
      {className: 'xds-textarea'},
    ],
  },
  accessibility: [
    'Label is always rendered in the DOM; use isLabelHidden to hide it visually while keeping it accessible.',
    'The textarea id is generated via useId and linked to its label via htmlFor, ensuring correct label association.',
    'aria-describedby is set to the description and/or status message IDs when those elements are present.',
    'aria-required="true" is set when isRequired is true.',
    'aria-invalid="true" is set when status.type is "error".',
    'aria-busy is set while an optimistic update or loading state is active.',
  ],
  notes: [
    'isOptional and isRequired are mutually exclusive; if both are set, "Optional" takes precedence.',
    'The component uses useOptimistic for instant UI feedback when onChangeAction returns a Promise.',
    'Textarea has vertical resize enabled via CSS.',
    'Wraps XDSField for consistent label, description, and status message layout.',
    'The character counter uses optimisticValue and turns red when it exceeds maxLength.',
    'Interaction is blocked during busy state (loading or pending async action) to prevent double-input.',
    'Character counter is connected to the textarea via aria-describedby and uses aria-live="polite" for screen reader announcements.',
  ],
  usage: {
    summary: 'A multi-line text input for collecting longer user input.',
    content: `## When to use

- Users need to enter multiple lines of text.
- Comments, descriptions, or longer-form content entry.

## When NOT to use

- Single-line input (use TextInput instead).
- Rich text with formatting (use a rich text editor instead).`,
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'TextArea',
  description:
    '用于收集较长用户输入的多行文本输入组件。',
  features: [
    '标签支持 — 必需的无障碍标签，可视觉隐藏',
    '描述 — 显示在标签和文本域之间的可选文本',
    '可选/必填指示器 — 显示带圆点分隔符的"可选"或"必填"文本',
    '状态变体 — 警告、错误和成功状态，带彩色边框和图标',
    '字符计数器 — 设置 maxLength 时显示当前/最大长度（不原生强制限制）',
    '起始图标 — 在输入框前端内部渲染的可选图标',
    '标签工具提示 — 标签末尾带工具提示的可选信息图标',
    '加载状态 — 显示旋转器并通过 useOptimistic 使用乐观更新',
    '异步操作支持 — onChangeAction 在 React transition 内于 onChange 之后触发',
    '禁用状态 — 视觉透明度和光标变化，无交互',
    '无障碍 — 标签通过 htmlFor/id 关联，aria-describedby、aria-required、aria-invalid、aria-busy',
    '可调整大小 — 默认启用垂直调整大小',
    '拼写检查 — 默认启用浏览器拼写检查，可配置',
    '减少动画 — 尊重 prefers-reduced-motion 输入包装过渡',
  ],
  props: [
    {
      name: 'ref',
      type: 'React.Ref<HTMLTextAreaElement>',
      description: '转发至底层 <textarea> 元素的 ref。',
    },
    {
      name: 'label',
      type: 'string',
      description:
        '文本域的标签文本 — 始终渲染以确保无障碍性。',
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
      name: 'onChangeAction',
      type: '(value: string, e: ChangeEvent<HTMLTextAreaElement>) => void | Promise<void>',
      description:
        '在 React transition 内于 onChange 之后触发的异步操作。通过 useOptimistic 启用乐观更新。',
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
      description: '显示在标签和文本域之间的辅助文本。',
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
      description: '禁用文本域，阻止交互。',
      default: 'false',
    },
    {
      name: 'isLoading',
      type: 'boolean',
      description:
        '使文本域进入加载状态，在输入框内显示旋转器。',
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
      description:
        '允许的最大字符数。设置后，在文本域下方显示字符计数器（当前/最大）。不原生强制限制——超出时计数器显示错误样式。',
    },
    {
      name: 'status',
      type: "{ type: 'warning' | 'error' | 'success'; message?: string }",
      description:
        '应用彩色边框和图标的状态指示器。可选消息显示在文本域下方的浮动框中。',
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
        '在文本域包装器前端内部渲染的图标组件。',
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
      name: 'onPaste',
      type: '(e: ClipboardEvent<HTMLTextAreaElement>) => void',
      description: '内容粘贴到文本域时触发的回调。',
    },
    {
      name: 'htmlName',
      type: 'string',
      description:
        '文本域元素的 HTML name 属性，用于表单提交。',
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
      description:
        'StyleX 样式，用于布局自定义（边距、定位、尺寸）。必须是 stylex.create() 的值，而非内联样式对象如 style={{}}。',
    },
  ],
  theming: {
    targets: [
      {className: 'xds-textarea'},
    ],
  },
  accessibility: [
    '标签始终在 DOM 中渲染；使用 isLabelHidden 视觉上隐藏它，同时保持无障碍性。',
    '文本域 id 通过 useId 生成并通过 htmlFor 与其标签关联，确保正确的标签关联。',
    '当描述和/或状态消息元素存在时，aria-describedby 设置为相应的 ID。',
    '当 isRequired 为 true 时，设置 aria-required="true"。',
    '当 status.type 为 "error" 时，设置 aria-invalid="true"。',
    '乐观更新或加载状态活跃期间设置 aria-busy。',
  ],
  notes: [
    'isOptional 和 isRequired 互斥；如果同时设置，"可选"优先。',
    '当 onChangeAction 返回 Promise 时，组件使用 useOptimistic 实现即时 UI 反馈。',
    '文本域通过 CSS 启用垂直调整大小。',
    '包装 XDSField 以实现一致的标签、描述和状态消息布局。',
    '字符计数器使用 optimisticValue，超出 maxLength 时变为红色。',
    '忙碌状态（加载中或异步操作等待中）期间阻止交互，防止重复输入。',
    '字符计数器通过 aria-describedby 连接到文本域，并使用 aria-live="polite" 进行屏幕阅读器公告。',
  ],
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'Multi-line text input for collecting longer user input.',
  features: [
    'Label support; required for a11y, can be visually hidden',
    'Description; optional text between label+textarea',
    'Optional/Required indicators; displays "Optional" or "Required" w/ bullet separator',
    'Status variants; warning, error, success states w/ colored borders+icons',
    'Character counter; displays current/max length when maxLength set',
    'Start icon; optional icon inside leading edge of input',
    'Label tooltip; optional info icon w/ tooltip at label end',
    'Loading state; shows spinner, uses optimistic updates via useOptimistic',
    'Async action support; onChangeAction fires after onChange in React transition',
    'Disabled state; visual opacity+cursor changes, no interaction',
    'Accessible; label via htmlFor/id, aria-describedby, aria-required, aria-invalid, aria-busy',
    'Resizable; vertical resize enabled by default',
    'Spell check; browser spell checking enabled by default, configurable',
    'Reduced motion; respects prefers-reduced-motion for input wrapper transitions',
  ],
  notes: [
    'isOptional+isRequired mutually exclusive; both set = "Optional" wins.',
    'Uses useOptimistic for instant UI feedback when onChangeAction returns Promise.',
    'Textarea has vertical resize via CSS.',
    'Wraps XDSField for consistent label, description, status message layout.',
    'Character counter uses optimisticValue; turns red when exceeds maxLength.',
    'Interaction blocked during busy state to prevent double-input.',
    'Counter connected via aria-describedby + aria-live="polite" for screen readers.',
  ],
  accessibility: [
    'Label always in DOM; isLabelHidden hides visually, keeps a11y.',
    'Textarea id via useId linked to label via htmlFor for correct association.',
    'aria-describedby set to description+status message IDs when present.',
    'aria-required="true" when isRequired is true.',
    'aria-invalid="true" when status.type is "error".',
    'aria-busy set during optimistic update or loading state.',
  ],
  propDescriptions: {
    ref: 'ref forwarded to underlying <textarea>.',
    label: 'Label text for textarea; always rendered for a11y.',
    value: 'Current textarea value.',
    onChange: 'Fired on textarea value change.',
    onChangeAction: 'Async action after onChange in React transition. Enables useOptimistic.',
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
    onPaste: 'Fired on paste into textarea.',
    htmlName: 'HTML name attr for form submissions.',
    onFocus: 'Callback on focus.',
    onBlur: 'Callback on blur.',
    xstyle: 'StyleX styles for layout customization. Must be stylex.create() value, not inline style.',
  },
};
