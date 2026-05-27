// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Card',
  group: 'Card',
  keywords: ["card","surface","panel","container","elevated","shadow","box","paper","tile","well"],
  usage: {
    description:
      'Card is a bordered, elevated container for discrete, self-contained items — things you could reorder, remove, or interact with independently. Cards are NOT the default layout tool. Most content groups don\'t need a container at all — spacing and alignment create visual grouping naturally. Only reach for a Card when items need clear interaction boundaries or visual comparison in a grid.',
    bestPractices: [
      {guidance: true, description: 'Ask "could I reorder or remove this independently?" If yes, it\'s a card. If no, it\'s just a section of the page — use a heading + XDSStack or XDSSection.'},
      {guidance: true, description: 'Use cards for discrete items: a single user profile, a single notification, a single metric, a product in a grid. Each card represents one "thing" with clear interaction boundaries.'},
      {guidance: true, description: 'Spacing and alignment alone create visual grouping. Not everything needs a container — try removing the card and see if the grouping is still clear from whitespace and typography.'},
      {guidance: true, description: 'Keep padding consistent across sibling cards so they align visually in a grid or list.'},
      {guidance: true, description: 'Pair a card with XDSLayout when you need a structured header, scrollable content, and footer with actions.'},
      {guidance: false, description: 'Default to cards for visual grouping. A heading + XDSStack with proper spacing creates hierarchy without adding borders everywhere. Cards should be the exception, not the default.'},
      {guidance: false, description: 'Wrap page sections in cards. "General Settings", "Notification Preferences", form groups — these are page regions, use XDSSection or heading + stack.'},
      {guidance: false, description: 'Create identical card grids (icon + heading + text, repeated). Vary the layout or question whether cards are needed at all.'},
      {guidance: false, description: 'Nest cards inside other cards — flatten the hierarchy or use spacing and dividers instead.'},
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
      'Card is a bordered, elevated container for discrete, self-contained items — things you could reorder, remove, or interact with independently. Cards are NOT the default layout tool. Most content groups don\'t need a container at all — spacing and alignment create visual grouping naturally. Only reach for a Card when items need clear interaction boundaries or visual comparison in a grid.',
    bestPractices: [
      {guidance: true, description: 'Ask "could I reorder or remove this independently?" If yes, it\'s a card. If no, it\'s just a section of the page — use a heading + XDSStack or XDSSection.'},
      {guidance: true, description: 'Use cards for discrete items: a single user profile, a single notification, a single metric, a product in a grid. Each card represents one "thing" with clear interaction boundaries.'},
      {guidance: true, description: 'Spacing and alignment alone create visual grouping. Not everything needs a container — try removing the card and see if the grouping is still clear from whitespace and typography.'},
      {guidance: true, description: 'Keep padding consistent across sibling cards so they align visually in a grid or list.'},
      {guidance: true, description: 'Pair a card with XDSLayout when you need a structured header, scrollable content, and footer with actions.'},
      {guidance: false, description: 'Default to cards for visual grouping. A heading + XDSStack with proper spacing creates hierarchy without adding borders everywhere. Cards should be the exception, not the default.'},
      {guidance: false, description: 'Wrap page sections in cards. "General Settings", "Notification Preferences", form groups — these are page regions, use XDSSection or heading + stack.'},
      {guidance: false, description: 'Create identical card grids (icon + heading + text, repeated). Vary the layout or question whether cards are needed at all.'},
      {guidance: false, description: 'Nest cards inside other cards — flatten the hierarchy or use spacing and dividers instead.'},
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
  description: 'bordered container for DISCRETE items — NOT the default layout tool. Most content doesn\'t need a card.',
  usage: {
    description:
      'Card is for discrete items with clear interaction boundaries (one profile, one notification, one product). Cards are NOT the default. Spacing and alignment create visual grouping without borders. Ask: "could I reorder or remove this independently?" — if no, don\'t use a card.',
    bestPractices: [
      {guidance: true, description: 'Use cards ONLY for discrete items you could reorder/remove independently. Not every group of content needs a container.'},
      {guidance: true, description: 'Try spacing + headings first. If the grouping is clear from whitespace and typography alone, you don\'t need a card.'},
      {guidance: true, description: 'For page sections (settings, forms, sidebars), use heading + XDSStack or XDSSection — not a card.'},
      {guidance: false, description: 'Default to wrapping content in cards. Cards should be the exception, not the reflex. Borders everywhere = visual noise.'},
      {guidance: false, description: 'Wrap page sections in cards. "General Settings" or "Preferences" are not cards.'},
      {guidance: false, description: 'Create identical card grids (icon + heading + text, repeated). This is the lazy default — vary layout or skip cards entirely.'},
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
