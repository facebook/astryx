/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Card',
  description: 'Card container component with shadow and themed styling.',
  showcase: {
    aspectRatio: 4 / 3,
    code: '<XDSCard>Card content</XDSCard>',
  },
  keywords: ["card","surface","panel","container","elevated","shadow","box","paper","tile","well"],
  features: [
    'Top-level container for elevated content',
    'Provides card-specific appearance: background, shadow, and border-radius',
    'Sets CSS variables for child layout components',
    'Supports `padding={0}` for edge-to-edge content',
    'Composable with XDSLayout, XDSCollapsible, and XDSCollapsibleGroup',
    'Background color variants: default, muted, and 10 non-semantic palette colors',
  ],
  props: [
    {
      name: 'width',
      type: 'SizeValue',
      description: 'Width of the card (number = pixels, string = used as-is).',
    },
    {
      name: 'height',
      type: 'SizeValue',
      description: 'Height of the card (number = pixels, string = used as-is).',
    },
    {
      name: 'maxWidth',
      type: 'SizeValue',
      description: 'Maximum width of the card.',
    },
    {
      name: 'minHeight',
      type: 'SizeValue',
      description: 'Minimum height of the card.',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Content to render inside the card.',
    },
    {
      name: 'padding',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description: 'Internal padding using the spacing scale.',
      default: '4',
    },
    {
      name: 'variant',
      type: "'default' | 'muted' | 'blue' | 'cyan' | 'gray' | 'green' | 'orange' | 'pink' | 'purple' | 'red' | 'teal' | 'yellow'",
      description:
        'Background color variant. `default` uses the standard card background. `muted` uses the wash background for de-emphasised cards. The non-semantic variants use the corresponding `--color-<name>-background` token.',
      default: "'default'",
    },
  ],
  theming: {
    container: true,
    targets: [
      {className: 'xds-card'},
    ],
    vars: [
      {name: '--card-radius', description: 'Border radius of the card', default: 'var(--radius-container)'},
    ],
    cssProperties: [
      {
        name: 'padding',
        description:
          "Controls Card container padding. Accepts standard CSS padding shorthand (e.g. '16px 20px'). Automatically mapped to container tokens for layout integration. Supports paddingBlock/paddingInline for axis-specific control.",
        default: 'var(--spacing-4)',
      },
    ],
  },
  usage: {
    summary: 'Groups similar information inside containers for visual organization.',
    content: `## When to use

- When explicit grouping of related information is needed.
- When browsing and scanning content is frequent.

## Best practices

- Do: Use whitespace, type scale, and dividers with cards.
- Do: Prioritize sections as the default; use cards only for stronger visual distinction.
- Don't: Exclusively use cards, as it diminishes visual hierarchy.
- Don't: Use cards for primary content unless stronger visual separation is needed.
- Start with sections; escalate to cards only when additional distinction is required.
- Card elevation adapts automatically based on the background surface.`,
    anatomy: [
      {name: 'Card Header', required: false, description: 'Displays a title and optional end content.'},
      {name: 'Card Body', required: true, description: 'Accepts any content.'},
      {name: 'Card Footer', required: false, description: 'Contains actions.'},
    ],
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Card',
  description: '具有阴影和主题样式的卡片容器组件。',
  features: [
    '用于承载内容的顶层容器',
    '提供卡片特有的外观：背景、阴影和圆角',
    '为子布局组件设置 CSS 变量',
    '支持 `padding={0}` 实现边到边内容',
    '可与 XDSLayout、XDSCollapsible 和 XDSCollapsibleGroup 组合使用',
  ],
  props: [
    {
      name: 'width',
      type: 'SizeValue',
      description: '卡片宽度（数字 = 像素，字符串 = 按原样使用）。',
    },
    {
      name: 'height',
      type: 'SizeValue',
      description: '卡片高度（数字 = 像素，字符串 = 按原样使用）。',
    },
    {
      name: 'maxWidth',
      type: 'SizeValue',
      description: '卡片最大宽度。',
    },
    {
      name: 'minHeight',
      type: 'SizeValue',
      description: '卡片最小高度。',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: '在卡片内部渲染的内容。',
    },
    {
      name: 'padding',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description: '使用间距比例的内边距。',
      default: '4',
    },
  ],
  theming: {
    container: true,
    targets: [
      {className: 'xds-card'},
    ],
    vars: [
      {name: '--card-radius', description: 'Border radius of the card', default: 'var(--radius-container)'},
    ],
    cssProperties: [
      {
        name: 'padding',
        description:
          "Controls Card container padding. Accepts standard CSS padding shorthand (e.g. '16px 20px'). Automatically mapped to container tokens for layout integration. Supports paddingBlock/paddingInline for axis-specific control.",
        default: 'var(--spacing-4)',
      },
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'elevated container w/ themed styling',
  features: [
    'top-level container for elevated content',
    'card appearance: background, shadow, border-radius',
    'sets CSS vars for child layout components',
    'optional full-bleed mode removes padding for edge-to-edge content',
    'composable w/ XDSLayout, XDSCollapsible, XDSCollapsibleGroup',
  ],
  propDescriptions: {
    width: 'card width (number=px, string=as-is)',
    height: 'card height (number=px, string=as-is)',
    maxWidth: 'max card width',
    minHeight: 'min card height',
    children: 'content inside card',
    padding: 'internal padding via spacing scale',
  },
};
