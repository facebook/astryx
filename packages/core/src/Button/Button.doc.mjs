/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Button',
  description:
    'XDSButton component with multiple variants, sizes, and isLoading state support.',
  showcase: {
    aspectRatio: 1,
    code: '<XDSButton label="Click me" variant="primary" />',
  },

  keywords: ["button","btn","cta","submit","action","loading","primary","secondary","ghost","destructive","danger"],
  features: [
    "Variants: 'primary', 'secondary', 'ghost', 'destructive'",
    'Sizes: sm (28px), md (32px), lg (36px)',
    'Loading state: Shows spinner, disables interaction, announces via live region',
    'Focus visible: Accessible focus outline with variant-specific colors',
    'Hover/active states: Uses overlay colors via backgroundImage for consistent layering',
    'Reduced motion: Respects prefers-reduced-motion for transitions',
    'Tooltip + disabled: Uses aria-disabled instead of native disabled so the button stays focusable for keyboard tooltip access',
    'Form integration: type, name, value, form props for native form submission',
    'Async actions: onClickAction with automatic loading state via useTransition',
  ],

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
  accessibility: [
    'Renders a native <button> element for correct semantics and keyboard support',
    'Icon-only buttons (isIconOnly={true}) set aria-label from the label prop',
    'Loading state sets aria-busy and announces "Loading" via a role="status" live region',
    'Content is hidden from assistive tech during loading via aria-hidden',
    'When tooltip is present and button is disabled, uses aria-disabled instead of native disabled to keep the button focusable for keyboard tooltip access',
    'Warns in development when icon-only buttons have an empty label (WCAG 4.1.2)',
    'aria-label, aria-busy, and aria-disabled are placed after ...props spread to prevent clobbering',
  ],
  keyboard: 'Enter/Space activates the button; Tab/Shift+Tab moves focus in and out',
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
  },
  notes: [
    'XDSButtonVariant type is derived from the variants StyleX object using keyof typeof variants.',
    'Hover/active states use backgroundImage with linear-gradient to layer overlay colors on top of the base background.',
    'Destructive variant uses colorTokens.negative for its focus outline color.',
    'endContent is wrapped in a <span> with color: inherit so icons/badges match the button text color across all variants.',
    'When isIconOnly is true, the button renders as a perfect square (aspectRatio: 1/1), and label is used as aria-label (not rendered visually). Works with any ReactNode as the icon — SVG components, emoji, or text.',
    'endContent is ignored when isIconOnly is true to preserve the square aspect ratio.',
    'Prefer XDSButton over <div onClick> or <span onClick> for accessibility — it provides keyboard navigation, focus management, and screen reader support.',
    'Icon-only buttons are suitable for toolbars, action grids, and compact controls.',
    'onClick fires before onClickAction; calling preventDefault in onClick prevents onClickAction from running.',
    'type defaults to "button" (not "submit") to prevent accidental form submission.',
    'Disabled background gradient is cleared (backgroundImage: none) to prevent hover tint leaking through opacity.',
  ],
  usage: {
    summary: 'Buttons provide visual cues for actions and events, allowing users to commit actions and navigate a page flow.',
    content: `## When to use

- Submit a form.
- Start a new task or action.
- Trigger a new UI element to appear on the page.

## Variants

- **Secondary**: The standard button for most actions.
- **Ghost**: Use when you need to limit the visual prominence of a button.
- **Primary**: Use to draw emphasis to the primary action. A layout should only contain a single primary button.
- **Destructive**: Use when the resulting action is the deletion of an object. Destructive buttons should trigger a confirmation dialog before the action is completed.

## Best practices

Do:
- Convey clear action hierarchy: each surface should only have one primary button. Most buttons should use the secondary or ghost variant.
- Use sentence case and no punctuation for labels.
- Provide the logical next step in a task.
- Use only one call-to-action per button.
- Use an informative tone. Don't editorialize in a button.

Don't:
- Overuse primary buttons. Overusing colored buttons creates visual confusion and undermines page hierarchy.
- Use all uppercase or all lowercase text.
- Mix sizes in a single row.
- Add custom gradients, drop shadows, or custom padding.`,
    anatomy: [
      {name: 'Icon', required: false, description: 'A leading icon that visually represents the meaning of the button label.'},
      {name: 'Label', required: true, description: 'A text label describing the button action. Required for accessibility.'},
      {name: 'End content', required: false, description: 'Trailing content that provides affordance to the type of action performed. Recommended when the expected action is non-obvious.'},
      {name: 'Spinner', required: false, description: 'Indicates a loading state when the button action is not immediate.'},
    ],
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Button',
  description:
    'XDSButton 组件，支持多种变体、尺寸和加载状态。',

  features: [
    "变体：'primary'、'secondary'、'ghost'、'destructive'",
    '尺寸：sm（28px）、md（32px）、lg（36px）',
    '加载状态：显示加载旋转器，禁用交互，通过实时区域播报',
    '焦点可见：带有变体特定颜色的无障碍焦点轮廓',
    '悬停/激活状态：通过 backgroundImage 使用叠加颜色，实现一致的层级效果',
    '减少动画：尊重 prefers-reduced-motion',
    '工具提示 + 禁用：使用 aria-disabled 代替原生 disabled，使按钮保持可聚焦以供键盘访问工具提示',
    '表单集成：type、name、value、form 属性支持原生表单提交',
    '异步操作：onClickAction 通过 useTransition 自动显示加载状态',
  ],

  props: [
    {
      name: 'label',
      type: 'string',
      description:
        '无障碍标签；纯图标按钮时用作 aria-label。',
      required: true,
    },
    {
      name: 'variant',
      type: "'primary' | 'secondary' | 'ghost' | 'destructive'",
      description: '视觉样式变体。',
      default: "'secondary'",
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: '尺寸变体。',
      default: "'md'",
    },
    {
      name: 'type',
      type: "'button' | 'submit' | 'reset'",
      description: 'HTML 按钮类型属性。',
      default: "'button'",
    },
    {
      name: 'name',
      type: 'string',
      description: '表单提交的 HTML name 属性。',
    },
    {
      name: 'value',
      type: 'string | number | readonly string[]',
      description: '表单提交的 HTML value 属性。',
    },
    {
      name: 'form',
      type: 'string',
      description: '通过 ID 将按钮与表单元素关联。',
    },
    {
      name: 'isLoading',
      type: 'boolean',
      description: '显示加载旋转器并禁用交互。通过实时区域播报"Loading"。',
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '禁用按钮。存在工具提示时，使用 aria-disabled 代替原生 disabled 以保持可聚焦。',
      default: 'false',
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description:
        '图标元素。仅提供 icon 而不提供 children 时，按钮渲染为正方形的纯图标按钮。',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description:
        '按钮内容。与 icon 同时提供时，文本渲染在图标旁边。',
    },
    {
      name: 'endContent',
      type: 'ReactElement<XDSIconProps> | ReactElement<XDSBadgeProps>',
      description:
        '标签后方渲染的尾部图标或徽章。仅接受 <XDSIcon> 或 <XDSBadge>。纯图标按钮时忽略。颜色继承自按钮变体。',
    },
    {
      name: 'tooltip',
      type: 'string',
      description: '悬停时显示的提示文本。',
    },
    {
      name: 'onClick',
      type: '(e: MouseEvent) => void',
      description:
        '标准点击处理函数（从 ButtonHTMLAttributes 透传）。',
    },
    {
      name: 'onClickAction',
      type: '(e: MouseEvent) => void | Promise<void>',
      description:
        '异步点击处理函数。返回的 Promise 处于 pending 状态时显示加载状态。',
    },
  ],

  accessibility: [
    '渲染原生 <button> 元素以确保正确的语义和键盘支持',
    '纯图标按钮（icon 无 children）从 label 属性设置 aria-label',
    '加载状态设置 aria-busy 并通过 role="status" 实时区域播报"Loading"',
    '加载期间通过 aria-hidden 对辅助技术隐藏内容',
    '当存在工具提示且按钮禁用时，使用 aria-disabled 代替原生 disabled 以保持键盘可聚焦',
    '开发环境下，纯图标按钮标签为空时发出警告（WCAG 4.1.2）',
    'aria-label、aria-busy、aria-disabled 放置在 ...props 展开之后以防止覆盖',
  ],
  keyboard: 'Enter/Space 激活按钮；Tab/Shift+Tab 移入和移出焦点',
  theming: {
    targets: [
      {className: 'xds-button', visualProps: ['size', 'variant']},
    ],
    vars: [
      {name: '--button-radius', description: '圆角半径', default: 'var(--radius-element)'},
      {name: '--button-press-scale', description: '按下时的变换', default: 'scale(0.98)'},
      {name: '--button-disabled-opacity', description: '禁用时的不透明度', default: '0.5'},
      {name: '--button-focus-offset', description: '焦点环轮廓偏移', default: '3px'},
      {name: '--button-icon-only-aspect', description: '纯图标按钮的宽高比', default: '1 / 1'},
    ],
  },
  notes: [
    'XDSButtonVariant 类型通过 keyof typeof variants 从 variants StyleX 对象派生。',
    '悬停/激活状态使用 backgroundImage 和 linear-gradient 在基础背景上叠加覆盖颜色。',
    'destructive 变体使用 colorTokens.negative 作为焦点轮廓颜色。',
    'endContent 包裹在带有 color: inherit 的 <span> 中，使图标/徽章在所有变体中匹配按钮文本颜色。',
    '仅提供 icon 而不提供 children 时，按钮变为纯图标模式：渲染为正方形（aspectRatio: 1/1），label 用作 aria-label（不可视渲染）。支持任何 ReactNode 作为图标——SVG 组件、emoji 或文本。',
    '纯图标按钮（提供 icon 但不提供 children 时）会忽略 endContent，以保持正方形的宽高比。',
    '为了无障碍性，优先使用 XDSButton 而非 <div onClick> 或 <span onClick>——它提供键盘导航、焦点管理和屏幕阅读器支持。',
    '纯图标按钮适用于工具栏、操作网格和紧凑控件。',
    'onClick 在 onClickAction 之前触发；在 onClick 中调用 preventDefault 会阻止 onClickAction 运行。',
    'type 默认为 "button"（非 "submit"）以防止意外的表单提交。',
    '禁用状态清除背景渐变（backgroundImage: none）以防止悬停色调通过不透明度泄漏。',
  ],
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'button w/ multiple variants, sizes, loading state',
  features: [
    "variants: primary, secondary, ghost, destructive",
    'sizes: sm(28px), md(32px), lg(36px)',
    'loading state: shows spinner+disables interaction, announces via live region',
    'focus visible: accessible focus outline w/ variant-specific colors',
    'hover/active: overlay colors via backgroundImage for consistent layering',
    'reduced motion: respects prefers-reduced-motion',
    'tooltip+disabled: aria-disabled keeps button focusable for keyboard tooltip',
    'form integration: type, name, value, form props',
    'async actions: onClickAction w/ automatic loading via useTransition',
  ],
  accessibility: [
    'Native <button> for correct semantics + keyboard support.',
    'Icon-only buttons (isIconOnly) set aria-label from label prop.',
    'Loading sets aria-busy + announces via role="status" live region.',
    'Content hidden from AT during loading via aria-hidden.',
    'Tooltip+disabled uses aria-disabled to stay focusable.',
    'Dev warning on empty label for icon-only (WCAG 4.1.2).',
    'aria-label, aria-busy, aria-disabled after ...props spread to prevent clobbering.',
  ],
  keyboard: 'Enter/Space=activate; Tab/Shift+Tab=move focus in/out.',
  notes: [
    'XDSButtonVariant derived from keyof typeof variants StyleX object',
    'hover/active use backgroundImage linear-gradient overlay on base bg',
    'destructive variant uses colorTokens.negative for focus outline',
    'endContent wrapped in <span> w/ color:inherit, matches button text across variants',
    'isIconOnly=true: square (aspectRatio:1/1), label=aria-label, any ReactNode as icon',
    'endContent ignored when isIconOnly to preserve square ratio',
    'prefer XDSButton over <div onClick> for a11y: keyboard nav, focus management, screen reader',
    'icon-only suits toolbars, action grids, compact controls',
    'onClick fires before onClickAction; preventDefault in onClick stops onClickAction',
    'type defaults to "button" (not "submit") to prevent accidental form submission',
    'disabled clears backgroundImage:none to prevent hover tint leaking through opacity',
  ],
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
