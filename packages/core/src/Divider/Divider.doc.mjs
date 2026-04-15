

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Divider',
  description: 'Visual separator with optional label, using XDS design tokens.',
  showcase: {
    aspectRatio: 16 / 4,
    code: '<XDSDivider />',
  },
  keywords: ["divider","separator","hr","rule","line","border","spacer","horizontal rule"],
  features: [
    'Supports horizontal and vertical orientations',
    'Optional label centered on the divider line',
    'Subtle and strong visual weight variants',
    'Full-bleed mode extends the divider to container edges via negative margins',
    'Themeable via className — target .xds-divider with variant and orientation classes',
  ],
  props: [
    {
      name: 'orientation',
      type: "'horizontal' | 'vertical'",
      description: 'Orientation of the divider.',
      default: "'horizontal'",
    },
    {
      name: 'label',
      type: 'ReactNode',
      description: 'Optional label centered on the divider.',
    },
    {
      name: 'variant',
      type: "'subtle' | 'strong'",
      description: 'Visual weight of the divider line.',
      default: "'subtle'",
    },
    {
      name: 'isFullBleed',
      type: 'boolean',
      description:
        'Extend the divider to container edges with negative margins.',
      default: 'false',
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
      {className: 'xds-divider', visualProps: ['orientation', 'variant']},
    ],
  },
  usage: {
    summary: 'Separates different pieces of content.',
    content: `## When to use

- Standard level: subtle hairlines to demote sections or regions.
- Emphasized level: critical visual lines for chart axes or input borders.
- High contrast level: strong visual separation.

## When NOT to use

- Emphasized dividers for sectional distinction \u2014 use standard instead.
- Standard dividers for critical content boundaries \u2014 use emphasized instead.

## Best practices

- Do: Use standard dividers for demoting sections and regions.
- Do: Use emphasized dividers for interactive element boundaries.
- Don't: Use emphasized dividers for sectional distinction.
- Don't: Use standard dividers for critical content boundaries.`,
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Divider',
  description: '带有可选标签的视觉分隔线，使用 XDS 设计令牌。',
  features: [
    '支持水平和垂直方向',
    '可选标签居中显示在分隔线上',
    '柔和和加强两种视觉粗细变体',
    '全出血模式通过负边距将分隔线延伸至容器边缘',
    '可通过 className 进行主题定制 — 使用变体和方向类定位 .xds-divider',
  ],
  props: [
    {
      name: 'orientation',
      type: "'horizontal' | 'vertical'",
      description: '分隔线的方向。',
      default: "'horizontal'",
    },
    {
      name: 'label',
      type: 'ReactNode',
      description: '居中显示在分隔线上的可选标签。',
    },
    {
      name: 'variant',
      type: "'subtle' | 'strong'",
      description: '分隔线的视觉粗细。',
      default: "'subtle'",
    },
    {
      name: 'isFullBleed',
      type: 'boolean',
      description: '通过负边距将分隔线延伸至容器边缘。',
      default: 'false',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局自定义的 StyleX 样式（边距、定位、尺寸）。必须是 stylex.create() 的值 — 不能是 style={{}} 这样的内联样式对象。',
    },
  ],
  theming: {
    targets: [
      {className: 'xds-divider', visualProps: ['orientation', 'variant']},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'visual separator w/ optional label, using XDS design tokens',
  features: [
    'horizontal+vertical orientations',
    'optional centered label on divider line',
    'subtle+strong visual weight variants',
    'full-bleed mode extends to container edges via negative margins',
    'themeable via className; target .xds-divider w/ variant+orientation classes',
  ],
  propDescriptions: {
    orientation: 'divider orientation',
    label: 'optional centered label on divider',
    variant: 'visual weight of divider line',
    isFullBleed: 'extend to container edges w/ negative margins',
    xstyle: 'StyleX styles for layout; must be stylex.create() value',
  },
};
