/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Icon',
  description:
    'Renders icons with XDS design system colors and sizes. Supports both direct SVG icon components and semantic icon names that adapt to the active theme.',
  showcase: {
    aspectRatio: 1,
    code: '<XDSIcon name="star" />',
  },
  keywords: ["icon","svg","glyph","symbol","pictogram","graphic","vector"],
  features: [
    "Semantic Icon Names: Use names like 'close' or 'chevronDown' — resolved from the theme's icon registry",
    'Direct Icon Components: Pass any SVG icon component (heroicons, lucide, etc.) directly',
    "Theme-Adaptable: Semantic icons automatically match the active theme's icon set",
    'Built-in Fallbacks: 12 lightweight inline SVGs (~1.4KB) ensure icons render without a theme',
    'Theme Colors: Color variants mapped to XDS icon color tokens',
    'Consistent Sizing: Four size options aligned with common UI patterns',
    'Accessible: Icons are hidden from screen readers by default (aria-hidden)',
  ],
  props: [
    {
      name: 'icon',
      type: 'XDSIconName | ComponentType<SVGProps>',
      description: 'Semantic name or SVG icon component.',
      required: true,
    },
    {
      name: 'color',
      type: "'primary' | 'secondary' | 'tertiary' | 'disabled' | 'accent' | 'positive' | 'negative' | 'warning' | 'inherit'",
      description: 'Color variant mapped to XDS icon color tokens.',
      default: "'primary'",
    },
    {
      name: 'size',
      type: "'xsm' | 'sm' | 'md' | 'lg'",
      description: 'Icon size.',
      default: "'md'",
    },
  ],
  theming: {
    targets: [
      {className: 'xds-icon', visualProps: ['color', 'size']},
    ],
  },
  accessibility: [
    'Icons are hidden from screen readers by default via aria-hidden="true" since icons are typically decorative.',
    'For meaningful icons, set aria-hidden={false}, role="img", and aria-label to provide accessible context.',
  ],
  notes: [
    'When icon is a semantic name string, resolution order is: (1) theme registry — if an XDSTheme is active and provides an icon for that name, it is used; (2) built-in fallback — otherwise, a lightweight inline SVG is rendered. Components always render visually complete, even without a theme. Themes can override any or all icons; the registry accepts partial overrides.',
    'When icon is a component, additional SVG props (like aria-label, role) are passed through to the underlying SVG element.',
    'flexShrink: 0 prevents icons from shrinking in flex containers.',
    'String mode wraps the resolved icon in a <span> with fontSize-based sizing so 1em-based registry icons scale correctly.',
    'Component mode passes stylex.props directly to the SVG element for zero-overhead styling.',
    'Semantic icon names and their usages — close (CloseButton, TimeInput): ✕ close/dismiss; chevronDown (DropdownMenu, Selector, TabMenu): ▾ expand/dropdown; chevronLeft (Calendar): ‹ previous; chevronRight (Calendar): › next; check (Selector, TabMenu): ✓ selected item; checkCircle (Input status): ✓○ success; xCircle (Input status): ✕○ error; warning (Input status): △! warning; info (FieldLabel): ⓘ information tooltip; calendar (DateInput): 📅 date picker; clock (TimeInput): 🕐 time picker; externalLink (Link): ↗ opens in new window.',
    'Color token mappings — primary: --color-icon-primary (default); secondary: --color-icon-secondary (de-emphasized); tertiary: --color-icon-secondary (subtle/background); disabled: --color-icon-disabled (disabled state); accent: --color-accent (interactive/actionable); positive: --color-success (success/confirmation); negative: --color-error (error/destructive); warning: --color-warning (caution/attention); inherit: currentColor (inherits from parent text color).',
    'Size dimensions — xsm: 12x12px (dense UI, badges, indicators); sm: 16x16px (inline with text, compact UI); md: 20x20px (default, buttons, inputs); lg: 24x24px (emphasis, standalone icons).',
  ],
  usage: {
    summary: 'Renders icons with XDS design system colors and sizes.',
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Icon',
  description:
    '使用 XDS 设计系统颜色和尺寸渲染图标。支持直接使用 SVG 图标组件和语义图标名称（可自动适配当前主题）。',
  features: [
    "语义图标名称：使用 'close' 或 'chevronDown' 等名称，从主题的图标注册表中解析",
    '直接图标组件：直接传入任何 SVG 图标组件（heroicons、lucide 等）',
    '主题适配：语义图标自动匹配当前活动主题的图标集',
    '内置回退：12 个轻量级内联 SVG（约 1.4KB）确保在无主题时也能正常渲染',
    '主题颜色：颜色变体映射到 XDS 图标颜色令牌',
    '一致的尺寸：四种尺寸选项，与常见 UI 模式对齐',
    '无障碍：图标默认对屏幕阅读器隐藏（aria-hidden）',
  ],
  props: [
    {
      name: 'icon',
      type: 'XDSIconName | ComponentType<SVGProps>',
      description: '语义名称或 SVG 图标组件。',
      required: true,
    },
    {
      name: 'color',
      type: "'primary' | 'secondary' | 'tertiary' | 'disabled' | 'accent' | 'positive' | 'negative' | 'warning' | 'inherit'",
      description: '映射到 XDS 图标颜色令牌的颜色变体。',
      default: "'primary'",
    },
    {
      name: 'size',
      type: "'xsm' | 'sm' | 'md' | 'lg'",
      description: '图标尺寸。',
      default: "'md'",
    },
  ],
  theming: {
    targets: [
      {className: 'xds-icon', visualProps: ['color', 'size']},
    ],
  },
  accessibility: [
    '图标默认通过 aria-hidden="true" 对屏幕阅读器隐藏，因为图标通常是装饰性的。',
    '对于有意义的图标，设置 aria-hidden={false}、role="img" 和 aria-label 以提供无障碍上下文。',
  ],
  notes: [
    '当 icon 为语义名称字符串时，解析顺序为：(1) 主题注册表——如果 XDSTheme 处于活动状态并为该名称提供了图标，则使用该图标；(2) 内置回退——否则渲染轻量级内联 SVG。组件始终能完整渲染，即使没有主题。主题可以覆盖任意或所有图标；注册表接受部分覆盖。',
    '当 icon 为组件时，额外的 SVG 属性（如 aria-label、role）会透传到底层 SVG 元素。',
    'flexShrink: 0 防止图标在 flex 容器中被压缩。',
    '字符串模式将解析后的图标包装在 <span> 中，使用基于 fontSize 的尺寸，使基于 1em 的注册表图标正确缩放。',
    '组件模式将 stylex.props 直接传递给 SVG 元素，实现零开销样式。',
    '语义图标名称及其用途——close（CloseButton、TimeInput）：✕ 关闭/消除；chevronDown（DropdownMenu、Selector、TabMenu）：▾ 展开/下拉；chevronLeft（Calendar）：‹ 上一个；chevronRight（Calendar）：› 下一个；check（Selector、TabMenu）：✓ 已选项；checkCircle（Input 状态）：✓○ 成功；xCircle（Input 状态）：✕○ 错误；warning（Input 状态）：△! 警告；info（FieldLabel）：ⓘ 信息提示；calendar（DateInput）：📅 日期选择器；clock（TimeInput）：🕐 时间选择器；externalLink（Link）：↗ 在新窗口中打开。',
    '颜色令牌映射——primary：--color-icon-primary（默认）；secondary：--color-icon-secondary（弱化）；tertiary：--color-icon-secondary（微妙/背景）；disabled：--color-icon-disabled（禁用状态）；accent：--color-accent（交互/可操作）；positive：--color-success（成功/确认）；negative：--color-error（错误/危险）；warning：--color-warning（警告/注意）；inherit：currentColor（继承父文本颜色）。',
    '尺寸规格——xsm：12x12px（密集 UI、徽章、指示器）；sm：16x16px（与文本内联、紧凑 UI）；md：20x20px（默认，按钮、输入框）；lg：24x24px（强调、独立图标）。',
  ],
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'Renders icons w/ XDS design system colors + sizes. Supports direct SVG icon components + semantic icon names that adapt to active theme.',
  features: [
    "Semantic icon names: use 'close' or 'chevronDown'; resolved from theme icon registry",
    'Direct icon components: pass any SVG component (heroicons, lucide, etc.)',
    "Theme-adaptable: semantic icons auto-match active theme's icon set",
    'Built-in fallbacks: 12 lightweight inline SVGs (~1.4KB) ensure rendering w/o theme',
    'Theme colors: variants mapped to XDS icon color tokens',
    'Consistent sizing: four size options aligned w/ common UI patterns',
    'Accessible: icons hidden from screen readers by default (aria-hidden)',
  ],
  notes: [
    'Semantic name resolution: (1) theme registry if XDSTheme active; (2) built-in fallback inline SVG. Themes accept partial overrides.',
    'Component icon passes extra SVG props (aria-label, role) through to SVG element.',
    'flexShrink: 0 prevents shrinking in flex containers.',
    'String mode wraps in <span> w/ fontSize-based sizing for 1em registry icons.',
    'Component mode passes stylex.props directly to SVG for zero-overhead styling.',
    'Semantic names: close (CloseButton, TimeInput) chevronDown (DropdownMenu, Selector, TabMenu) chevronLeft/Right (Calendar) check (Selector, TabMenu) checkCircle/xCircle/warning (Input status) info (FieldLabel) calendar (DateInput) clock (TimeInput) externalLink (Link).',
    'Color tokens: primary=--color-icon-primary; secondary=--color-icon-secondary; tertiary=--color-icon-secondary; disabled=--color-icon-disabled; accent=--color-accent; positive=--color-success; negative=--color-error; warning=--color-warning; inherit=currentColor.',
    'Size: xsm=12x12px sm=16x16px md=20x20px lg=24x24px.',
  ],
  accessibility: [
    'Icons hidden from screen readers by default via aria-hidden="true"; typically decorative.',
    'For meaningful icons: set aria-hidden={false}, role="img", aria-label for accessible context.',
  ],
  propDescriptions: {
    icon: 'Semantic name or SVG icon component.',
    color: 'Color variant mapped to XDS icon color tokens.',
    size: 'Icon size.',
  },
};
