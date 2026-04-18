/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Card',
  keywords: ["card","surface","panel","container","elevated","shadow","box","paper","tile","well"],
  usage: {
    description:
      'Card is an elevated container that groups related information for visual organization. Use cards when explicit grouping is needed and sections alone do not provide enough visual distinction.',
    bestPractices: [
      {guidance: true, description: 'Reserve cards for content that benefits from visual separation — default to sections first.'},
      {guidance: true, description: 'Use a consistent padding value across sibling cards to maintain visual alignment.'},
      {guidance: false, description: 'Nest cards inside other cards — flatten the hierarchy or use a different container.'},
    ],
    anatomy: [
      {name: 'Card Header', required: false, description: 'Displays a title and optional end content.'},
      {name: 'Card Body', required: true, description: 'Accepts any content.'},
      {name: 'Card Footer', required: false, description: 'Contains actions.'},
    ],
  },
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
    derived: [
      {property: 'borderRadius', description: 'Border radius of the card', default: 'var(--radius-container)', vars: ['--card-radius']},
      {property: 'padding', description: 'Container padding of the card', default: 'var(--spacing-4)', expand: 'container'},
    ],
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Card',
  usage: {
    description:
      'Card is an elevated container that groups related information for visual organization. Use cards when explicit grouping is needed and sections alone do not provide enough visual distinction.',
    bestPractices: [
      {guidance: true, description: 'Reserve cards for content that benefits from visual separation — default to sections first.'},
      {guidance: true, description: 'Use a consistent padding value across sibling cards to maintain visual alignment.'},
      {guidance: false, description: 'Nest cards inside other cards — flatten the hierarchy or use a different container.'},
    ],
    anatomy: [
      {name: 'Card Header', required: false, description: 'Displays a title and optional end content.'},
      {name: 'Card Body', required: true, description: 'Accepts any content.'},
      {name: 'Card Footer', required: false, description: 'Contains actions.'},
    ],
  },
  props: [
    {name: 'width', type: 'SizeValue', description: '卡片宽度（数字 = 像素，字符串 = 按原样使用）。'},
    {name: 'height', type: 'SizeValue', description: '卡片高度（数字 = 像素，字符串 = 按原样使用）。'},
    {name: 'maxWidth', type: 'SizeValue', description: '卡片最大宽度。'},
    {name: 'minHeight', type: 'SizeValue', description: '卡片最小高度。'},
    {name: 'children', type: 'ReactNode', description: '在卡片内部渲染的内容。'},
    {name: 'padding', type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10', description: '使用间距比例的内边距。', default: '4'},
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
    derived: [
      {property: 'borderRadius', description: 'Border radius of the card', default: 'var(--radius-container)', vars: ['--card-radius']},
      {property: 'padding', description: 'Container padding of the card', default: 'var(--spacing-4)', expand: 'container'},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'elevated container w/ themed styling',
  usage: {
    description:
      'Card is an elevated container that groups related information for visual organization. Use cards when explicit grouping is needed and sections alone do not provide enough visual distinction.',
    bestPractices: [
      {guidance: true, description: 'Reserve cards for content that benefits from visual separation — default to sections first.'},
      {guidance: true, description: 'Use a consistent padding value across sibling cards to maintain visual alignment.'},
      {guidance: false, description: 'Nest cards inside other cards — flatten the hierarchy or use a different container.'},
    ],
    anatomy: [
      {name: 'Card Header', required: false, description: 'Displays a title and optional end content.'},
      {name: 'Card Body', required: true, description: 'Accepts any content.'},
      {name: 'Card Footer', required: false, description: 'Contains actions.'},
    ],
  },
  propDescriptions: {
    width: 'card width (number=px, string=as-is)',
    height: 'card height (number=px, string=as-is)',
    maxWidth: 'max card width',
    minHeight: 'min card height',
    children: 'content inside card',
    padding: 'internal padding via spacing scale',
  },
};
