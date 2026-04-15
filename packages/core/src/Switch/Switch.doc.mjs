/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Switch',
  description:
    'A toggle switch component for boolean values with integrated label support.',
  showcase: {
    aspectRatio: 4 / 3,
    code: '<XDSSwitch label="Dark mode" />',
  },
  keywords: ["switch","toggle","onoff","flipswitch","boolean","toggleswitch"],
  features: [
    'Boolean toggle — fixed 40x24px track with animated 16px (off) / 20px (on) thumb',
    'Label integration — uses XDSFieldLabel for accessible labels with optional tooltip and icon',
    'Label position — label can appear before or after the switch via labelPosition',
    'Label spacing — supports spread layout to push label and switch to opposite ends',
    'Description — optional description text displayed below the label',
    'Optional/required indicators — visual markers for field status',
    'Status messages — error, warning, success, or info message boxes below the switch',
    'Async action support — onChangeAction with optimistic UI and built-in loading spinner',
    'Accessibility — native checkbox with role="switch", aria-describedby, aria-invalid, aria-busy',
    'Reduced motion — respects prefers-reduced-motion for track and thumb transitions',
  ],  props: [
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
      name: 'onChangeAction',
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
      description: 'Icon displayed before the label text.',
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
  accessibility: [
    'Renders a native <input type="checkbox" role="switch"> for correct switch semantics',
    'Label is always associated via htmlFor/id even when visually hidden',
    'Description text is linked via aria-describedby on the input element',
    'Status messages are linked via aria-describedby; aria-invalid is set when status type is "error"',
    'aria-busy is set during async onChangeAction execution',
  ],
  keyboard: 'Space toggles the switch; Tab/Shift+Tab moves focus in and out',
  notes: [
    'Fixed dimensions: 40px width, 24px height, 16px thumb (off), 20px thumb (on)',
    'Track and thumb use CSS transitions for background-color, transform, width, and height',
    'Hover tints are applied via stylex.when.ancestor with a @media (hover: hover) guard',
    'onChangeAction uses React useTransition and useOptimistic for seamless async toggling',
    'labelPosition="start" with labelSpacing="spread" produces a settings panel style layout',
    'Follows the same patterns as XDSCheckboxInput for structural consistency',
    'Interaction is blocked during busy state (loading or pending async action) to prevent double-toggling',
    'Track and thumb transitions respect prefers-reduced-motion (0s duration when reduced motion preferred)',
  ],
  usage: {
    summary: 'Conveys a binary on/off state that takes effect immediately.',
    content: `## When to use

- Settings that take effect immediately upon toggling.

## When NOT to use

- When changes require a separate submit step \u2014 use a checkbox instead.`,
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Switch',
  description:
    '用于布尔值的开关切换组件，集成标签支持。',
  features: [
    '布尔值切换 — 固定 40x24px 轨道，带动画效果的 16px（关闭）/ 20px（开启）滑块',
    '标签集成 — 使用 XDSFieldLabel 实现无障碍标签，支持可选的工具提示和图标',
    '标签位置 — 通过 labelPosition 可将标签放置在开关前面或后面',
    '标签间距 — 支持分散布局，将标签和开关推到容器两端',
    '描述 — 可选的描述文本，显示在标签下方',
    '可选/必填指示器 — 字段状态的可视标记',
    '状态消息 — 开关下方的错误、警告、成功或信息消息框',
    '异步操作支持 — onChangeAction 支持乐观 UI 和内置加载旋转器',
    '无障碍 — 原生复选框，具有 role="switch"、aria-describedby、aria-invalid、aria-busy',
  ],
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
      name: 'onChangeAction',
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
  accessibility: [
    '渲染原生 <input type="checkbox" role="switch"> 以确保正确的开关语义',
    '标签始终通过 htmlFor/id 关联，即使视觉上被隐藏',
    '描述文本通过输入元素上的 aria-describedby 关联',
    '状态消息通过 aria-describedby 关联；当状态类型为 "error" 时设置 aria-invalid',
    '异步 onChangeAction 执行期间设置 aria-busy',
  ],
  keyboard: '空格键切换开关；Tab/Shift+Tab 移入和移出焦点',
  notes: [
    '固定尺寸：40px 宽，24px 高，16px 滑块（关闭），20px 滑块（开启）',
    '轨道和滑块使用 CSS 过渡实现 background-color、transform、width 和 height 的动画',
    '悬停色调通过 stylex.when.ancestor 应用，带有 @media (hover: hover) 守卫',
    'onChangeAction 使用 React useTransition 和 useOptimistic 实现无缝异步切换',
    'labelPosition="start" 配合 labelSpacing="spread" 生成设置面板样式的布局',
    '遵循与 XDSCheckboxInput 相同的模式以保持结构一致性',
  ],
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'Toggle switch for boolean values w/ integrated label support.',
  features: [
    'Boolean toggle; fixed 40x24px track w/ animated 16px (off) / 20px (on) thumb',
    'Label integration; uses XDSFieldLabel for accessible labels w/ optional tooltip + icon',
    'Label position; label before or after switch via labelPosition',
    'Label spacing; spread layout pushes label + switch to opposite ends',
    'Description; optional text below label',
    'Optional/required indicators; visual markers for field status',
    'Status messages; error, warning, success, or info boxes below switch',
    'Async action support; onChangeAction w/ optimistic UI + built-in loading spinner',
    'Accessible; native checkbox w/ role="switch", aria-describedby, aria-invalid, aria-busy',
  ],
  notes: [
    'Fixed dimensions: 40px wide, 24px high, 16px thumb (off), 20px thumb (on).',
    'Track + thumb use CSS transitions for background-color, transform, width, height.',
    'Hover tints via stylex.when.ancestor w/ @media (hover: hover) guard.',
    'onChangeAction uses React useTransition + useOptimistic for seamless async toggling.',
    'labelPosition="start" + labelSpacing="spread" produces settings panel layout.',
    'Follows same patterns as XDSCheckboxInput for structural consistency.',
  ],
  accessibility: [
    'Native <input type="checkbox" role="switch"> for correct semantics.',
    'Label always associated via htmlFor/id even when visually hidden.',
    'Description linked via aria-describedby on input element.',
    'Status messages linked via aria-describedby; aria-invalid set on error type.',
    'aria-busy set during async onChangeAction execution.',
  ],
  keyboard: 'Space=toggle; Tab/Shift+Tab=move focus in/out.',
  propDescriptions: {
    ref: 'ref forwarded to underlying <input>',
    label: 'Label text (always rendered for a11y).',
    value: 'Whether switch is on or off.',
    onChange: 'Fired when switch state changes.',
    onChangeAction: 'Async action after onChange; triggers optimistic UI + loading spinner until resolved.',
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