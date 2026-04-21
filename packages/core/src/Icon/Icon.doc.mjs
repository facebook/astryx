/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Icon',
  keywords: ["icon","svg","glyph","symbol","pictogram","graphic","vector"],
  props: [
    {
      name: 'icon',
      type: 'XDSIconName | ComponentType<SVGProps>',
      description: 'Semantic icon name or SVG component. Run `npx xds docs icons` for valid names.',
      required: true,
    },
    {
      name: 'color',
      type: "'primary' | 'secondary' | 'tertiary' | 'disabled' | 'accent' | 'positive' | 'negative' | 'warning' | 'inherit'",
      description: 'Color variant mapped to XDS icon color tokens.',
      default: "'inherit'",
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
  usage: {
    description: 'Renders icons using XDS design system colors and sizes. Supports both direct SVG icon components and semantic icon names that adapt to the active theme. Use Icon wherever a visual symbol is needed to reinforce meaning or provide wayfinding.',
    bestPractices: [
      { guidance: true, description: 'Use semantic icon names when available — they automatically adapt to the active theme.' },
      { guidance: true, description: 'Pair standalone icons with an accessible label (aria-label) when they convey meaning beyond decoration.' },
      { guidance: false, description: 'Rely on an icon alone to communicate critical information — always pair with text or an accessible label.' },
    ],
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Icon',
  props: [
    {
      name: 'icon',
      type: 'XDSIconName | ComponentType<SVGProps>',
      description: '语义图标名称或 SVG 组件。运行 `npx xds docs icons` 查看可用名称。',
      required: true,
    },
    {
      name: 'color',
      type: "'primary' | 'secondary' | 'tertiary' | 'disabled' | 'accent' | 'positive' | 'negative' | 'warning' | 'inherit'",
      description: '映射到 XDS 图标颜色令牌的颜色变体。',
      default: "'inherit'",
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
  usage: {
    description: 'Renders icons using XDS design system colors and sizes. Supports both direct SVG icon components and semantic icon names that adapt to the active theme. Use Icon wherever a visual symbol is needed to reinforce meaning or provide wayfinding.',
    bestPractices: [
      { guidance: true, description: 'Use semantic icon names when available — they automatically adapt to the active theme.' },
      { guidance: true, description: 'Pair standalone icons with an accessible label (aria-label) when they convey meaning beyond decoration.' },
      { guidance: false, description: 'Rely on an icon alone to communicate critical information — always pair with text or an accessible label.' },
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'Renders icons w/ XDS design system colors + sizes. Supports direct SVG icon components + semantic icon names that adapt to active theme.',
  usage: {
    description: 'Renders icons using XDS design system colors and sizes. Supports both direct SVG icon components and semantic icon names that adapt to the active theme. Use Icon wherever a visual symbol is needed to reinforce meaning or provide wayfinding.',
    bestPractices: [
      { guidance: true, description: 'Use semantic icon names when available — they automatically adapt to the active theme.' },
      { guidance: true, description: 'Pair standalone icons with an accessible label (aria-label) when they convey meaning beyond decoration.' },
      { guidance: false, description: 'Rely on an icon alone to communicate critical information — always pair with text or an accessible label.' },
    ],
  },
  propDescriptions: {
    icon: 'Semantic icon name or SVG component. See `npx xds docs icons`.',
    color: 'Color variant mapped to XDS icon color tokens.',
    size: 'Icon size.',
  },
};
