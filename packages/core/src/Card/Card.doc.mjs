// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Card',
  group: 'Card',
  keywords: ["card","surface","panel","container","elevated","shadow","box","paper","tile","well"],
  usage: {
    description:
      'Card is a bordered, elevated container for discrete, self-contained items — things you could reorder, remove, or interact with independently. Do NOT use cards to create page sections or group form fields. For page layout, use XDSSection or just a heading with a vertical stack.',
    bestPractices: [
      {guidance: true, description: 'Use cards for discrete items: a single user profile, a single notification, a single metric, a product in a grid. Each card should represent one "thing" you could act on independently.'},
      {guidance: true, description: 'For page sections (e.g. "General Settings", "Notification Preferences"), use a heading + XDSStack or XDSSection instead — page sections are not cards.'},
      {guidance: true, description: 'Keep padding consistent across sibling cards so they align visually in a grid or list.'},
      {guidance: true, description: 'Use the muted variant for secondary content like tips, callouts, or background information.'},
      {guidance: true, description: 'Pair a card with XDSLayout when you need a structured header, scrollable content, and footer with actions.'},
      {guidance: false, description: 'Wrap every group of content in a Card. If the content is a section of a page (settings group, form section, sidebar area), use a heading + stack or XDSSection with dividers — not a card.'},
      {guidance: false, description: 'Nest cards inside other cards — flatten the hierarchy or use a section instead.'},
      {guidance: false, description: 'Use color variants for status — use Banner or Badge for that. Color cards are for categorization.'},
    ],
    anatomy: [
      {name: 'Container', required: true, description: 'The outer box with border, background, border-radius, and padding.'},
      {name: 'Content', required: true, description: 'Any children rendered inside the card. Often a stack of heading, text, and actions.'},
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
        'Background color variant. `default` uses the standard card background. `muted` uses the muted background for de-emphasised cards. The non-semantic variants use the corresponding `--color-<name>-background` token.',
      default: "'default'",
    },
  ],
  playground: {
    defaults: {
      padding: 4,
      children: {
        __element: 'XDSVStack',
        props: {gap: 2},
        children: [
          {__element: 'XDSHeading', props: {level: 3}, children: 'Card Title'},
          {__element: 'XDSText', props: {type: 'body'}, children: 'Card content goes here. This is a standard card with a heading and body text.'},
        ],
      },
    },
  },
  theming: {
    container: true,
    targets: [
      {className: 'xds-card'},
    ],
    vars: [
      {name: '--_card-radius', description: 'Border radius of the card', default: 'var(--radius-container)', private: true},
    ],
    derived: [
      {property: 'borderRadius', vars: ['--_card-radius']},
      {property: 'padding', expand: 'container'},
    ],
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Card',
  usage: {
    description:
      'Card is a bordered, elevated container for discrete, self-contained items — things you could reorder, remove, or interact with independently. Do NOT use cards to create page sections or group form fields. For page layout, use XDSSection or just a heading with a vertical stack.',
    bestPractices: [
      {guidance: true, description: 'Use cards for discrete items: a single user profile, a single notification, a single metric, a product in a grid. Each card should represent one "thing" you could act on independently.'},
      {guidance: true, description: 'For page sections (e.g. "General Settings", "Notification Preferences"), use a heading + XDSStack or XDSSection instead — page sections are not cards.'},
      {guidance: true, description: 'Keep padding consistent across sibling cards so they align visually in a grid or list.'},
      {guidance: true, description: 'Use the muted variant for secondary content like tips, callouts, or background information.'},
      {guidance: true, description: 'Pair a card with XDSLayout when you need a structured header, scrollable content, and footer with actions.'},
      {guidance: false, description: 'Wrap every group of content in a Card. If the content is a section of a page (settings group, form section, sidebar area), use a heading + stack or XDSSection with dividers — not a card.'},
      {guidance: false, description: 'Nest cards inside other cards — flatten the hierarchy or use a section instead.'},
      {guidance: false, description: 'Use color variants for status — use Banner or Badge for that. Color cards are for categorization.'},
    ],
    anatomy: [
      {name: 'Container', required: true, description: 'The outer box with border, background, border-radius, and padding.'},
      {name: 'Content', required: true, description: 'Any children rendered inside the card. Often a stack of heading, text, and actions.'},
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
      {name: '--_card-radius', description: 'Border radius of the card', default: 'var(--radius-container)', private: true},
    ],
    derived: [
      {property: 'borderRadius', vars: ['--_card-radius']},
      {property: 'padding', expand: 'container'},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'bordered container for DISCRETE items (profiles, notifications, metrics) — NOT for page sections',
  usage: {
    description:
      'Card is for discrete, self-contained items you could reorder or remove independently. NOT for page sections — use heading + XDSStack or XDSSection for that.',
    bestPractices: [
      {guidance: true, description: 'Use cards for discrete items: one profile, one notification, one metric, one product. Things you could reorder or act on independently.'},
      {guidance: true, description: 'For page sections (settings groups, form areas), use a heading + XDSStack or XDSSection with dividers — not a card.'},
      {guidance: true, description: 'Use muted variant for secondary content. Pair with XDSLayout for header/content/footer.'},
      {guidance: false, description: 'Wrap page sections in cards. "General Settings" or "Preferences" are not cards — use XDSSection or heading + stack.'},
      {guidance: false, description: 'Nest cards. Use color variants for status — use Banner or Badge instead.'},
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
