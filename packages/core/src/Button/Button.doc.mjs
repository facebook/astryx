/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Button',

  keywords: ["button","btn","cta","submit","action","loading","primary","secondary","ghost","destructive","danger"],

  usage: {
    description:
      'Buttons provide visual cues for actions and events. These fundamental components allow users to commit actions and navigate a page flow. Use a Button when a user needs to submit a form, start a new task or action, or trigger a new UI element to appear on the page.',
    bestPractices: [
      {guidance: true, description: 'Use secondary for most actions and reserve primary for a single emphasized action per layout.'},
      {guidance: true, description: 'Include a clear, concise label that describes the action the button performs.'},
      {guidance: false, description: 'Place more than one primary button in the same view — this dilutes the visual hierarchy.'},
      {guidance: false, description: 'Use the destructive variant without a confirmation step for irreversible actions.'},
    ],
    anatomy: [
      {name: 'Icon', required: false, description: 'A leading icon that visually represents the meaning of the button label.'},
      {name: 'Label', required: true, description: 'A text label describing the button action. Required for accessibility.'},
      {name: 'End content', required: false, description: 'Trailing content that provides affordance to the type of action performed. Recommended when the expected action is non-obvious.'},
      {name: 'Spinner', required: false, description: 'Indicates a loading state when the button action is not immediate.'},
    ],
  },

  props: [
    {
      name: 'label',
      type: 'string',
      description:
        'Accessible label. Rendered as visible text by default; used as aria-label when isIconOnly is true.',
      required: true,
    },
    {
      name: 'variant',
      type: "'primary' | 'secondary' | 'ghost' | 'destructive'",
      description: 'Visual style variant.',
      default: "'secondary'",
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: 'Size variant.',
      default: "'md'",
    },
    {
      name: 'type',
      type: "'button' | 'submit' | 'reset'",
      description: 'HTML button type attribute.',
      default: "'button'",
    },
    {
      name: 'name',
      type: 'string',
      description: 'HTML name attribute for form submission.',
    },
    {
      name: 'value',
      type: 'string | number | readonly string[]',
      description: 'HTML value attribute for form submission.',
    },
    {
      name: 'form',
      type: 'string',
      description: 'Associates the button with a form element by ID.',
    },
    {
      name: 'isLoading',
      type: 'boolean',
      description: 'Shows a loading spinner and disables interaction. Announces "Loading" via a live region.',
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: 'Disables the button. When a tooltip is present, uses aria-disabled instead of native disabled so the button stays focusable.',
      default: 'false',
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description:
        'Icon element rendered before the label text.',
    },
    {
      name: 'isIconOnly',
      type: 'boolean',
      description:
        'When true, renders as a square icon-only button with label as aria-label. Requires icon.',
      default: 'false',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description:
        'Optional visible content. When provided, rendered instead of label as the visible text.',
    },
    {
      name: 'endContent',
      type: 'ReactElement<XDSIconProps> | ReactElement<XDSBadgeProps>',
      description:
        'Trailing icon or badge rendered after the label. Ignored when isIconOnly is true. Color is inherited from the button variant.',
    },
    {
      name: 'tooltip',
      type: 'string',
      description: 'Tooltip text shown on hover.',
    },
    {
      name: 'onClick',
      type: '(e: MouseEvent) => void',
      description:
        'Standard click handler (passed through from ButtonHTMLAttributes).',
    },
    {
      name: 'onClickAction',
      type: '(e: MouseEvent) => void | Promise<void>',
      description:
        'Async click handler. Shows loading state while the returned promise is pending.',
    },
  ],
  theming: {
    targets: [
      {className: 'xds-button', visualProps: ['size', 'variant']},
    ],
    vars: [
      {name: '--button-radius', description: 'Border radius', default: 'var(--radius-element)'},
      {name: '--button-press-scale', description: 'Active press transform', default: 'scale(0.98)'},
      {name: '--button-disabled-opacity', description: 'Opacity when disabled', default: '0.5'},
      {name: '--button-focus-offset', description: 'Focus ring outline offset', default: '3px'},
      {name: '--button-icon-only-aspect', description: 'Aspect ratio for icon-only buttons', default: '1 / 1'},
    ],
    derived: [
      {property: 'borderRadius', description: 'Border radius of buttons', default: 'var(--radius-element)', vars: ['--button-radius']},
    ],
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Button',
  usage: {
    description:
      'Buttons provide visual cues for actions and events. These fundamental components allow users to commit actions and navigate a page flow. Use a Button when a user needs to submit a form, start a new task or action, or trigger a new UI element to appear on the page.',
    bestPractices: [
      {guidance: true, description: 'Use secondary for most actions and reserve primary for a single emphasized action per layout.'},
      {guidance: true, description: 'Include a clear, concise label that describes the action the button performs.'},
      {guidance: false, description: 'Place more than one primary button in the same view — this dilutes the visual hierarchy.'},
      {guidance: false, description: 'Use the destructive variant without a confirmation step for irreversible actions.'},
    ],
    anatomy: [
      {name: 'Icon', required: false, description: 'A leading icon that visually represents the meaning of the button label.'},
      {name: 'Label', required: true, description: 'A text label describing the button action. Required for accessibility.'},
      {name: 'End content', required: false, description: 'Trailing content that provides affordance to the type of action performed. Recommended when the expected action is non-obvious.'},
      {name: 'Spinner', required: false, description: 'Indicates a loading state when the button action is not immediate.'},
    ],
  },
  props: [
    {name: 'label', type: 'string', description: '无障碍标签；纯图标按钮时用作 aria-label。', required: true},
    {
      name: 'variant',
      type: "'primary' | 'secondary' | 'ghost' | 'destructive'",
      description: '视觉样式变体。',
      default: "'secondary'",
    },
    {name: 'size', type: "'sm' | 'md' | 'lg'", description: '尺寸变体。', default: "'md'"},
    {name: 'type', type: "'button' | 'submit' | 'reset'", description: 'HTML 按钮类型属性。', default: "'button'"},
    {name: 'name', type: 'string', description: '表单提交的 HTML name 属性。'},
    {name: 'value', type: 'string | number | readonly string[]', description: '表单提交的 HTML value 属性。'},
    {name: 'form', type: 'string', description: '通过 ID 将按钮与表单元素关联。'},
    {name: 'isLoading', type: 'boolean', description: '显示加载旋转器并禁用交互。通过实时区域播报"Loading"。', default: 'false'},
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '禁用按钮。存在工具提示时，使用 aria-disabled 代替原生 disabled 以保持可聚焦。',
      default: 'false',
    },
    {name: 'icon', type: 'ReactNode', description: '图标元素。仅提供 icon 而不提供 children 时，按钮渲染为正方形的纯图标按钮。'},
    {name: 'children', type: 'ReactNode', description: '按钮内容。与 icon 同时提供时，文本渲染在图标旁边。'},
    {
      name: 'endContent',
      type: 'ReactElement<XDSIconProps> | ReactElement<XDSBadgeProps>',
      description:
        '标签后方渲染的尾部图标或徽章。仅接受 <XDSIcon> 或 <XDSBadge>。纯图标按钮时忽略。颜色继承自按钮变体。',
    },
    {name: 'tooltip', type: 'string', description: '悬停时显示的提示文本。'},
    {name: 'onClick', type: '(e: MouseEvent) => void', description: '标准点击处理函数（从 ButtonHTMLAttributes 透传）。'},
    {
      name: 'onClickAction',
      type: '(e: MouseEvent) => void | Promise<void>',
      description: '异步点击处理函数。返回的 Promise 处于 pending 状态时显示加载状态。',
    },
  ],
  theming: {
    targets: [
      {
        className: 'xds-button',
        visualProps: [
          'size',
          'variant',
        ],
      },
    ],
    vars: [
      {name: '--button-radius', description: '圆角半径', default: 'var(--radius-element)'},
      {name: '--button-press-scale', description: '按下时的变换', default: 'scale(0.98)'},
      {name: '--button-disabled-opacity', description: '禁用时的不透明度', default: '0.5'},
      {name: '--button-focus-offset', description: '焦点环轮廓偏移', default: '3px'},
      {name: '--button-icon-only-aspect', description: '纯图标按钮的宽高比', default: '1 / 1'},
    ],
    derived: [
      {property: 'borderRadius', description: 'Border radius of buttons', default: 'var(--radius-element)', vars: ['--button-radius']},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'button w/ multiple variants, sizes, loading state',
  usage: {
    description:
      'Buttons provide visual cues for actions and events. These fundamental components allow users to commit actions and navigate a page flow. Use a Button when a user needs to submit a form, start a new task or action, or trigger a new UI element to appear on the page.',
    bestPractices: [
      {guidance: true, description: 'Use secondary for most actions and reserve primary for a single emphasized action per layout.'},
      {guidance: true, description: 'Include a clear, concise label that describes the action the button performs.'},
      {guidance: false, description: 'Place more than one primary button in the same view — this dilutes the visual hierarchy.'},
      {guidance: false, description: 'Use the destructive variant without a confirmation step for irreversible actions.'},
    ],
    anatomy: [
      {name: 'Icon', required: false, description: 'A leading icon that visually represents the meaning of the button label.'},
      {name: 'Label', required: true, description: 'A text label describing the button action. Required for accessibility.'},
      {name: 'End content', required: false, description: 'Trailing content that provides affordance to the type of action performed. Recommended when the expected action is non-obvious.'},
      {name: 'Spinner', required: false, description: 'Indicates a loading state when the button action is not immediate.'},
    ],
  },
  propDescriptions: {
    label: 'accessible label; visible text by default, aria-label when isIconOnly',
    variant: 'visual style variant',
    size: 'size variant',
    type: 'HTML button type; defaults to "button"',
    name: 'HTML name for form submission',
    value: 'HTML value for form submission',
    form: 'associates button with form element by ID',
    isLoading: 'shows spinner+disables interaction; announces via live region',
    icon: 'icon element rendered before label text',
    isIconOnly: 'when true, renders square icon-only button; label becomes aria-label',
    children: 'optional visible content; rendered instead of label when provided',
    endContent: 'trailing icon/badge after label; ignored when isIconOnly; color inherited',
    tooltip: 'tooltip on hover',
    onClick: 'standard click handler; fires before onClickAction',
    onClickAction: 'async click handler; shows loading while promise pending',
    isDisabled: 'disables button; uses aria-disabled when tooltip present',
  },
};
