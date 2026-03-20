/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Button',
  description:
    'XDSButton component with multiple variants, sizes, and isLoading state support.',

  features: [
    "Variants: 'primary', 'secondary', 'ghost', 'destructive'",
    'Sizes: sm (28px), md (32px), lg (36px)',
    'Loading state: Shows spinner, disables interaction',
    'Focus visible: Accessible focus outline with variant-specific colors',
    'Hover/active states: Uses overlay colors via backgroundImage for consistent layering',
  ],

  props: [
    {
      name: 'label',
      type: 'string',
      description:
        'Accessible label; used as aria-label for icon-only buttons.',
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
      name: 'isLoading',
      type: 'boolean',
      description: 'Shows a loading spinner and disables interaction.',
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: 'Disables the button.',
      default: 'false',
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description:
        'Icon element. When provided without children the button renders as a square icon-only button.',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description:
        'Button content. When provided alongside icon, the text is rendered next to the icon.',
    },
    {
      name: 'endSlot',
      type: 'ReactElement<XDSIconProps> | ReactElement<XDSBadgeProps>',
      description:
        'Trailing icon or badge rendered after the label. Only accepts <XDSIcon> or <XDSBadge>. Ignored for icon-only buttons. Color is inherited from the button variant.',
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

  examples: [
    {
      label: 'Basic',
      code: '<XDSButton label="Click me" variant="primary" />',
    },
    {
      label: 'With size',
      code: '<XDSButton label="Large button" variant="primary" size="lg" />',
    },
    {
      label: 'Loading state',
      code: '<XDSButton label="Saving..." variant="primary" isLoading />',
    },
    {
      label: 'Destructive action',
      code: '<XDSButton label="Delete" variant="destructive" />',
    },
    {
      label: 'Icon-only button',
      code: `// Pass \`icon\` without \`children\` — \`label\` becomes the aria-label
<XDSButton label="Settings" icon={<GearIcon />} variant="ghost" />`,
    },
    {
      label: 'Icon-only with emoji content',
      code: '<XDSButton label="Select rocket emoji" icon={<span>🚀</span>} variant="ghost" size="sm" />',
    },
    {
      label: 'Icon + visible label',
      code: '<XDSButton label="Edit" icon={<PencilIcon />}>Edit</XDSButton>',
    },
    {
      label: 'endSlot — badge after label',
      code: '<XDSButton label="Messages" endSlot={<XDSBadge label={3} />} />',
    },
    {
      label: 'endSlot — icon, label, and badge',
      code: '<XDSButton label="Edit" icon={<PencilIcon />} endSlot={<XDSBadge label="New" />}>Edit</XDSButton>',
    },
    {
      label: 'endSlot — settings with badge',
      code: `<XDSButton label="Settings" icon={<GearIcon />} endSlot={<XDSBadge label="New" />}>
  Settings
</XDSButton>`,
    },
  ],

  theming: {
    targets: [
      {className: 'xds-button', visualProps: ['size', 'variant']},
    ],
    vars: [
      {name: '--button-radius', description: 'Border radius', default: 'var(--radius-2)'},
    ],
  },
  notes: [
    'XDSButtonVariant type is derived from the variants StyleX object using keyof typeof variants.',
    'Hover/active states use backgroundImage with linear-gradient to layer overlay colors on top of the base background.',
    'Destructive variant uses colorTokens.negative for its focus outline color.',
    'endSlot is wrapped in a <span> with color: inherit so icons/badges match the button text color across all variants.',
    'When icon is provided without children, the button becomes icon-only: it renders as a perfect square (aspectRatio: 1/1), and label is used as aria-label (not rendered visually). Works with any ReactNode as the icon — SVG components, emoji, or text.',
    'endSlot is ignored for icon-only buttons (when icon is provided without children) to preserve the square aspect ratio.',
    'Prefer XDSButton over <div onClick> or <span onClick> for accessibility — it provides keyboard navigation, focus management, and screen reader support.',
    'Icon-only buttons are suitable for toolbars, action grids, and compact controls.',
  ],
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Button',
  description:
    'XDSButton 组件，支持多种变体、尺寸和加载状态。',

  features: [
    "变体：'primary'、'secondary'、'ghost'、'destructive'",
    '尺寸：sm（28px）、md（32px）、lg（36px）',
    '加载状态：显示加载旋转器，禁用交互',
    '焦点可见：带有变体特定颜色的无障碍焦点轮廓',
    '悬停/激活状态：通过 backgroundImage 使用叠加颜色，实现一致的层级效果',
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
      name: 'isLoading',
      type: 'boolean',
      description: '显示加载旋转器并禁用交互。',
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '禁用按钮。',
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
      name: 'endSlot',
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

  examples: [
    {
      label: '基础用法',
      code: '<XDSButton label="Click me" variant="primary" />',
    },
    {
      label: '指定尺寸',
      code: '<XDSButton label="Large button" variant="primary" size="lg" />',
    },
    {
      label: '加载状态',
      code: '<XDSButton label="Saving..." variant="primary" isLoading />',
    },
    {
      label: '危险操作',
      code: '<XDSButton label="Delete" variant="destructive" />',
    },
    {
      label: '纯图标按钮',
      code: `// Pass \`icon\` without \`children\` — \`label\` becomes the aria-label
<XDSButton label="Settings" icon={<GearIcon />} variant="ghost" />`,
    },
    {
      label: '纯图标按钮（emoji 内容）',
      code: '<XDSButton label="Select rocket emoji" icon={<span>🚀</span>} variant="ghost" size="sm" />',
    },
    {
      label: '图标 + 可见标签',
      code: '<XDSButton label="Edit" icon={<PencilIcon />}>Edit</XDSButton>',
    },
    {
      label: 'endSlot——标签后的徽章',
      code: '<XDSButton label="Messages" endSlot={<XDSBadge label={3} />} />',
    },
    {
      label: 'endSlot——图标、标签和徽章',
      code: '<XDSButton label="Edit" icon={<PencilIcon />} endSlot={<XDSBadge label="New" />}>Edit</XDSButton>',
    },
    {
      label: 'endSlot——带徽章的设置按钮',
      code: `<XDSButton label="Settings" icon={<GearIcon />} endSlot={<XDSBadge label="New" />}>
  Settings
</XDSButton>`,
    },
  ],

  theming: {
    targets: [
      {className: 'xds-button', visualProps: ['size', 'variant']},
    ],
    vars: [
      {name: '--button-radius', description: 'Border radius', default: 'var(--radius-2)'},
    ],
  },
  notes: [
    'XDSButtonVariant 类型通过 keyof typeof variants 从 variants StyleX 对象派生。',
    '悬停/激活状态使用 backgroundImage 和 linear-gradient 在基础背景上叠加覆盖颜色。',
    'destructive 变体使用 colorTokens.negative 作为焦点轮廓颜色。',
    'endSlot 包裹在带有 color: inherit 的 <span> 中，使图标/徽章在所有变体中匹配按钮文本颜色。',
    '仅提供 icon 而不提供 children 时，按钮变为纯图标模式：渲染为正方形（aspectRatio: 1/1），label 用作 aria-label（不可视渲染）。支持任何 ReactNode 作为图标——SVG 组件、emoji 或文本。',
    '纯图标按钮（提供 icon 但不提供 children 时）会忽略 endSlot，以保持正方形的宽高比。',
    '为了无障碍性，优先使用 XDSButton 而非 <div onClick> 或 <span onClick>——它提供键盘导航、焦点管理和屏幕阅读器支持。',
    '纯图标按钮适用于工具栏、操作网格和紧凑控件。',
  ],
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'button w/ multiple variants, sizes, loading state',
  features: [
    "variants: primary, secondary, ghost, destructive",
    'sizes: sm(28px), md(32px), lg(36px)',
    'loading state: shows spinner+disables interaction',
    'focus visible: accessible focus outline w/ variant-specific colors',
    'hover/active: overlay colors via backgroundImage for consistent layering',
  ],
  notes: [
    'XDSButtonVariant derived from keyof typeof variants StyleX object',
    'hover/active use backgroundImage linear-gradient overlay on base bg',
    'destructive variant uses colorTokens.negative for focus outline',
    'endSlot wrapped in <span> w/ color:inherit, matches button text across variants',
    'icon w/o children=icon-only: square (aspectRatio:1/1), label=aria-label, any ReactNode as icon',
    'endSlot ignored for icon-only to preserve square ratio',
    'prefer XDSButton over <div onClick> for a11y: keyboard nav, focus management, screen reader',
    'icon-only suits toolbars, action grids, compact controls',
  ],
  propDescriptions: {
    label: 'accessible label; aria-label for icon-only buttons',
    variant: 'visual style variant',
    size: 'size variant',
    isLoading: 'shows spinner+disables interaction',
    icon: 'icon element; w/o children renders square icon-only button',
    children: 'w/ icon, text rendered next to icon',
    endSlot: 'trailing icon/badge after label; accepts XDSIcon or XDSBadge; ignored for icon-only; color inherited',
    tooltip: 'tooltip on hover',
    onClick: 'standard click handler',
    onClickAction: 'async click handler; shows loading while promise pending',
    isDisabled: 'disables the button',
  },
};
