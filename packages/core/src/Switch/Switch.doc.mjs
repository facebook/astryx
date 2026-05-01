/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Switch',
  keywords: ["switch","toggle","onoff","flipswitch","boolean","toggleswitch"],
  props: [
    {
      name: 'ref',
      type: 'React.Ref<HTMLInputElement>',
      description: 'Ref forwarded to the underlying <input> element.',
    },
    {
      name: 'label',
      type: 'string',
      description:
        'Label text for the switch (always rendered for accessibility).',
      required: true,
    },
    {
      name: 'value',
      type: 'boolean',
      description: 'Whether the switch is on or off.',
      required: true,
    },
    {
      name: 'onChange',
      type: '(checked: boolean, e: ChangeEvent<HTMLInputElement>) => void',
      description: 'Callback fired when the switch state changes.',
    },
    {
      name: 'changeAction',
      type: '(checked: boolean, e: ChangeEvent<HTMLInputElement>) => void | Promise<void>',
      description:
        'Async action fired after onChange. Triggers optimistic UI and shows a loading spinner until the promise resolves.',
    },
    {
      name: 'isLoading',
      type: 'boolean',
      description:
        'Whether the switch is in a loading state, showing a spinner inside the thumb.',
      default: 'false',
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
      description: 'Description text displayed below the label.',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: 'Whether the switch is disabled.',
      default: 'false',
    },
    {
      name: 'isOptional',
      type: 'boolean',
      description:
        'Whether the field is optional. Mutually exclusive with isRequired.',
      default: 'false',
    },
    {
      name: 'isRequired',
      type: 'boolean',
      description:
        'Whether the switch is required. Mutually exclusive with isOptional.',
      default: 'false',
    },
    {
      name: 'status',
      type: 'XDSInputStatus',
      description:
        'Status indicator with type and message. Displays a colored message box below the switch and sets aria-invalid when type is "error".',
    },
    {
      name: 'onFocus',
      type: '(e: FocusEvent<HTMLInputElement>) => void',
      description: 'Callback fired when the switch receives focus.',
    },
    {
      name: 'onBlur',
      type: '(e: FocusEvent<HTMLInputElement>) => void',
      description: 'Callback fired when the switch loses focus.',
    },
    {
      name: 'labelIcon',
      type: 'XDSIconType',
      description: 'Icon displayed before the label text. See `npx xds docs icons` for valid semantic names.',
    },
    {
      name: 'labelTooltip',
      type: 'string',
      description:
        'Tooltip text shown in an info icon at the end of the label.',
    },
    {
      name: 'labelPosition',
      type: "'start' | 'end'",
      description:
        'Which side of the switch the label appears on. "start" places the label before the switch.',
      default: "'end'",
    },
    {
      name: 'labelSpacing',
      type: "'default' | 'spread'",
      description:
        'Spacing behavior between label and switch. "spread" pushes them to opposite ends of the container (full width).',
      default: "'default'",
    },
  ],
  theming: {
    targets: [
      {className: 'xds-switch', states: ['checked', 'disabled']},
      {className: 'xds-switch-thumb', states: ['checked']},
      {className: 'xds-switch-field', visualProps: ['labelPosition', 'labelSpacing']},
    ],
  },
  usage: {
    description:
      'A toggle control for on/off states that take effect immediately. Supports labels, descriptions, loading states, and validation. Use it for settings or preferences that apply instantly. For changes requiring a form submission, use a checkbox instead.',
    bestPractices: [
      { guidance: true, description: 'Use for settings that apply immediately — the toggle should take effect without a separate save action.' },
      { guidance: true, description: 'Pair with a clear, concise label that describes the setting being controlled.' },
      { guidance: false, description: 'Use for options that require a form submission to take effect — use a checkbox instead.' },
      { guidance: false, description: 'Use a switch for multi-state values — it\'s strictly on/off.' },
    ],
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Switch',
  props: [
    {
      name: 'ref',
      type: 'React.Ref<HTMLInputElement>',
      description: '转发至底层 <input> 元素的 ref。',
    },
    {
      name: 'label',
      type: 'string',
      description:
        '开关的标签文本（始终渲染以确保无障碍性）。',
      required: true,
    },
    {
      name: 'value',
      type: 'boolean',
      description: '开关是开启还是关闭。',
      required: true,
    },
    {
      name: 'onChange',
      type: '(checked: boolean, e: ChangeEvent<HTMLInputElement>) => void',
      description: '开关状态变化时触发的回调。',
    },
    {
      name: 'changeAction',
      type: '(checked: boolean, e: ChangeEvent<HTMLInputElement>) => void | Promise<void>',
      description:
        '在 onChange 之后触发的异步操作。触发乐观 UI 并显示加载旋转器直到 Promise 完成。',
    },
    {
      name: 'isLoading',
      type: 'boolean',
      description:
        '开关是否处于加载状态，在滑块内显示旋转器。',
      default: 'false',
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
      description: '显示在标签下方的描述文本。',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '开关是否被禁用。',
      default: 'false',
    },
    {
      name: 'isOptional',
      type: 'boolean',
      description:
        '字段是否为可选。与 isRequired 互斥。',
      default: 'false',
    },
    {
      name: 'isRequired',
      type: 'boolean',
      description:
        '开关是否为必填。与 isOptional 互斥。',
      default: 'false',
    },
    {
      name: 'status',
      type: 'XDSInputStatus',
      description:
        '带类型和消息的状态指示器。在开关下方显示彩色消息框，当类型为 "error" 时设置 aria-invalid。',
    },
    {
      name: 'onFocus',
      type: '(e: FocusEvent<HTMLInputElement>) => void',
      description: '开关获得焦点时触发的回调。',
    },
    {
      name: 'onBlur',
      type: '(e: FocusEvent<HTMLInputElement>) => void',
      description: '开关失去焦点时触发的回调。',
    },
    {
      name: 'labelIcon',
      type: 'XDSIconType',
      description: '显示在标签文本前面的图标。',
    },
    {
      name: 'labelTooltip',
      type: 'string',
      description:
        '在标签末尾的信息图标中显示的工具提示文本。',
    },
    {
      name: 'labelPosition',
      type: "'start' | 'end'",
      description:
        '标签出现在开关的哪一侧。"start" 将标签放在开关前面。',
      default: "'end'",
    },
    {
      name: 'labelSpacing',
      type: "'default' | 'spread'",
      description:
        '标签和开关之间的间距行为。"spread" 将它们推到容器的两端（全宽）。',
      default: "'default'",
    },
  ],
  theming: {
    targets: [
      {className: 'xds-switch', states: ['checked', 'disabled']},
      {className: 'xds-switch-thumb', states: ['checked']},
      {className: 'xds-switch-field', visualProps: ['labelPosition', 'labelSpacing']},
    ],
  },
  usage: {
    description:
      'A toggle control for on/off states that take effect immediately. Supports labels, descriptions, loading states, and validation. Use it for settings or preferences that apply instantly. For changes requiring a form submission, use a checkbox instead.',
    bestPractices: [
      { guidance: true, description: 'Use for settings that apply immediately — the toggle should take effect without a separate save action.' },
      { guidance: true, description: 'Pair with a clear, concise label that describes the setting being controlled.' },
      { guidance: false, description: 'Use for options that require a form submission to take effect — use a checkbox instead.' },
      { guidance: false, description: 'Use a switch for multi-state values — it\'s strictly on/off.' },
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'Toggle switch for boolean values w/ integrated label support.',
  usage: {
    description:
      'A toggle control for on/off states that take effect immediately. Supports labels, descriptions, loading states, and validation. Use it for settings or preferences that apply instantly. For changes requiring a form submission, use a checkbox instead.',
    bestPractices: [
      { guidance: true, description: 'Use for settings that apply immediately — the toggle should take effect without a separate save action.' },
      { guidance: true, description: 'Pair with a clear, concise label that describes the setting being controlled.' },
      { guidance: false, description: 'Use for options that require a form submission to take effect — use a checkbox instead.' },
      { guidance: false, description: 'Use a switch for multi-state values — it\'s strictly on/off.' },
    ],
  },
  propDescriptions: {
    ref: 'ref forwarded to underlying <input>',
    label: 'Label text (always rendered for a11y).',
    value: 'Whether switch is on or off.',
    onChange: 'Fired when switch state changes.',
    changeAction: 'Async action after onChange; triggers optimistic UI + loading spinner until resolved.',
    isLoading: 'Loading state; shows spinner in thumb.',
    isLabelHidden: 'Visually hides label; still accessible to screen readers.',
    description: 'Description text below label.',
    isDisabled: 'Whether switch is disabled.',
    isOptional: 'Whether field is optional; mutually exclusive w/ isRequired.',
    isRequired: 'Whether switch is required; mutually exclusive w/ isOptional.',
    status: 'Status indicator w/ type + message; colored message box, sets aria-invalid on error.',
    onFocus: 'Fired when switch receives focus.',
    onBlur: 'Fired when switch loses focus.',
    labelIcon: 'Icon before label text.',
    labelTooltip: 'Tooltip text in info icon at label end.',
    labelPosition: 'Which side label appears; "start" places before switch.',
    labelSpacing: 'Spacing behavior; "spread" pushes to opposite ends (full width).',
  },
};