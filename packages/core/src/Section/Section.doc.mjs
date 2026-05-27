// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Section',
  group: 'Layout',
  keywords: ["section","panel","container","group","fieldset","region","block"],
  props: [
    {
      name: 'variant',
      type: "'section' | 'transparent' | 'muted'",
      description: 'Background variant applied to the section container.',
      default: "'section'",
    },
    {
      name: 'width',
      type: 'SizeValue',
      description:
        'Width of the section; a number is interpreted as pixels, a string is used as-is.',
    },
    {
      name: 'height',
      type: 'SizeValue',
      description:
        'Height of the section; a number is interpreted as pixels, a string is used as-is.',
    },
    {
      name: 'maxWidth',
      type: 'SizeValue',
      description: 'Maximum width of the section.',
    },
    {
      name: 'minHeight',
      type: 'SizeValue',
      description: 'Minimum height of the section.',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Content rendered inside the section.',
    },
    {
      name: 'dividers',
      type: "Array<'top' | 'bottom' | 'start' | 'end'>",
      description: 'Which sides of the section have divider borders.',
    },
    {
      name: 'padding',
      type: 'SpacingStep',
      description: 'Internal padding using the spacing scale (0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10). Use padding={0} for edge-to-edge content.',
      default: '4',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: 'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value, not an inline style object.',
    },
  ],
  theming: {
    container: true,
    targets: [
      {className: 'xds-section', visualProps: ['variant']},
    ],
    derived: [
      {property: 'padding', expand: 'container'},
    ],
  },
  usage: {
    description:
      'Section is the correct way to create page regions and group related content on a page. Use it for settings groups, form sections, sidebar areas, or any time you need visual separation between parts of a page. If you are tempted to use a Card for a page section — use XDSSection instead.',
    bestPractices: [
      { guidance: true, description: 'Use Section for page-level grouping: settings panels, form groups, sidebar regions. These are sections of a page, not discrete items.' },
      { guidance: true, description: 'Start with the default variant. Use muted only to call attention to a specific region.' },
      { guidance: true, description: 'Add dividers between same-background sections that need separation.' },
      { guidance: true, description: 'Combine with a heading + XDSStack for a typical page section pattern.' },
      { guidance: false, description: 'Use Card when you mean Section. Cards are for discrete items (one notification, one profile). Sections are for page regions.' },
    ],
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Section',
  props: [
    {
      name: 'variant',
      type: "'section' | 'transparent' | 'muted'",
      description: '应用于区域容器的背景变体。',
      default: "'section'",
    },
    {
      name: 'width',
      type: 'SizeValue',
      description:
        '区域的宽度；数字类型会被解释为像素值，字符串类型按原样使用。',
    },
    {
      name: 'height',
      type: 'SizeValue',
      description:
        '区域的高度；数字类型会被解释为像素值，字符串类型按原样使用。',
    },
    {
      name: 'maxWidth',
      type: 'SizeValue',
      description: '区域的最大宽度。',
    },
    {
      name: 'minHeight',
      type: 'SizeValue',
      description: '区域的最小高度。',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: '在区域内部渲染的内容。',
    },
    {
      name: 'dividers',
      type: "Array<'top' | 'bottom' | 'start' | 'end'>",
      description: '区域的哪些边具有分隔线边框。',
    },
    {
      name: 'padding',
      type: 'SpacingStep',
      description: '使用间距比例的内部内边距（0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10）。使用 padding={0} 实现全宽内容。',
      default: '4',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: '用于布局自定义的 StyleX 样式（外边距、定位、尺寸）。必须是 stylex.create() 的值，不能是内联样式对象。',
    },
  ],
  theming: {
    container: true,
    targets: [
      {className: 'xds-section', visualProps: ['variant']},
    ],
    derived: [
      {property: 'padding', expand: 'container'},
    ],
  },
  usage: {
    description:
      'Section is the correct way to create page regions and group related content on a page. Use it for settings groups, form sections, sidebar areas, or any time you need visual separation between parts of a page. If you are tempted to use a Card for a page section — use XDSSection instead.',
    bestPractices: [
      { guidance: true, description: 'Use Section for page-level grouping: settings panels, form groups, sidebar regions. These are sections of a page, not discrete items.' },
      { guidance: true, description: 'Start with the default variant. Use muted only to call attention to a specific region.' },
      { guidance: true, description: 'Add dividers between same-background sections that need separation.' },
      { guidance: true, description: 'Combine with a heading + XDSStack for a typical page section pattern.' },
      { guidance: false, description: 'Use Card when you mean Section. Cards are for discrete items (one notification, one profile). Sections are for page regions.' },
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'Page-level container for grouping content into regions. Use INSTEAD of Card for settings panels, form groups, and page sections.',
  usage: {
    description:
      'Section creates page regions. Use for settings groups, form sections, sidebar areas. If you want to visually separate a part of a page, use Section — not Card. Cards are for discrete items (one profile, one notification).',
    bestPractices: [
      { guidance: true, description: 'Use Section for page-level grouping (settings, forms, sidebars). Use heading + XDSStack inside for content.' },
      { guidance: true, description: 'Default variant = white surface. Muted = gray for emphasis. Add dividers for separation.' },
      { guidance: false, description: 'Use Card for page sections. Cards = discrete items. Sections = page regions.' },
    ],
  },
  propDescriptions: {
    variant: 'Background variant applied to section container.',
    width: 'Section width; number interpreted as pixels, string used as-is.',
    height: 'Section height; number interpreted as pixels, string used as-is.',
    maxWidth: 'Maximum width of section.',
    minHeight: 'Minimum height of section.',
    children: 'Content rendered inside section.',
    dividers: 'Which sides of section have divider borders.',
    padding: 'Internal padding via spacing scale; 0 for edge-to-edge content.',
    xstyle: 'StyleX styles for layout customization; must be stylex.create() value.',
  },
};
