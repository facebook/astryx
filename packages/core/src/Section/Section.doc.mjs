/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Section',
  keywords: ["section","panel","container","group","fieldset","region","block"],
  props: [
    {
      name: 'variant',
      type: "'section' | 'transparent' | 'wash'",
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
      name: 'paddingBlock',
      type: 'SpacingStep',
      description: 'Block (vertical) padding override. When set, overrides only the block axis padding while preserving inline padding from padding or the container theme default.',
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
      'Section is a container with background variants for creating visually distinct regions on a page. It automatically escapes parent padding for edge-to-edge fills. Use sections as the default page structure; reach for cards only when stronger visual distinction is needed.',
    bestPractices: [
      { guidance: true, description: 'Use dividers to separate adjacent sections when background variants alone do not provide enough visual contrast.' },
      { guidance: true, description: 'Default to the section variant for standard content regions; reserve wash for highlighted or grouped areas.' },
      { guidance: false, description: 'Wrap content in a Section and a Card together — choose one container type to avoid redundant nesting.' },
    ],
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Section',
  props: [
    {
      name: 'variant',
      type: "'section' | 'transparent' | 'wash'",
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
      name: 'paddingBlock',
      type: 'SpacingStep',
      description: '块方向（垂直）内边距覆盖。设置后，仅覆盖块轴方向的内边距，同时保留来自 padding 或容器主题默认值的行内方向内边距。',
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
      'Section is a container with background variants for creating visually distinct regions on a page. It automatically escapes parent padding for edge-to-edge fills. Use sections as the default page structure; reach for cards only when stronger visual distinction is needed.',
    bestPractices: [
      { guidance: true, description: 'Use dividers to separate adjacent sections when background variants alone do not provide enough visual contrast.' },
      { guidance: true, description: 'Default to the section variant for standard content regions; reserve wash for highlighted or grouped areas.' },
      { guidance: false, description: 'Wrap content in a Section and a Card together — choose one container type to avoid redundant nesting.' },
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'Container w/ background variants for creating visually distinct regions; auto-escapes parent container padding for edge-to-edge fills.',
  usage: {
    description:
      'Section is a container with background variants for creating visually distinct regions on a page. It automatically escapes parent padding for edge-to-edge fills. Use sections as the default page structure; reach for cards only when stronger visual distinction is needed.',
    bestPractices: [
      { guidance: true, description: 'Use dividers to separate adjacent sections when background variants alone do not provide enough visual contrast.' },
      { guidance: true, description: 'Default to the section variant for standard content regions; reserve wash for highlighted or grouped areas.' },
      { guidance: false, description: 'Wrap content in a Section and a Card together — choose one container type to avoid redundant nesting.' },
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
    paddingBlock: 'Block-axis padding override; preserves inline padding from padding prop or theme default.',
  },
};
