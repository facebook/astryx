/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Section',
  description:
    'Container with background variants for creating visually distinct regions that automatically escape parent container padding for edge-to-edge fills.',
  features: [
    'Background variants: section, transparent, and wash',
    'Automatically escapes parent container padding for edge-to-edge fills',
    'Supports divider borders on any combination of sides (top, bottom, start, end)',
    'Flexible sizing via SizeValue for width, height, maxWidth, and minHeight',
    'Supports `padding={0}` for edge-to-edge content',
  ],
  examples: [
    {
      label: 'Wash variant',
      code: `<XDSSection variant="wash" width={300} height={250}>
  <XDSLayout
    content={<XDSLayoutContent>Content in wash section</XDSLayoutContent>}
  />
</XDSSection>`,
    },
    {
      label: 'Transparent variant',
      code: `<XDSSection variant="transparent">
  <XDSLayout
    content={<XDSLayoutContent>Transparent background</XDSLayoutContent>}
  />
</XDSSection>`,
    },
    {
      label: 'With dividers',
      code: `<XDSSection variant="section" dividers={['top', 'bottom']}>
  <XDSLayout
    content={<XDSLayoutContent>Section with top and bottom borders</XDSLayoutContent>}
  />
</XDSSection>`,
    },
    {
      label: 'Full bleed',
      code: `<XDSSection variant="wash" padding={0}>
  <XDSLayout
    content={<XDSLayoutContent>Edge-to-edge content</XDSLayoutContent>}
  />
</XDSSection>`,
    },
  ],
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
      name: 'xstyle',
      type: 'StyleXStyles',
      description: 'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value, not an inline style object.',
    },
  ],
  theming: {
    targets: [
      {className: 'xds-section', visualProps: ['variant']},
    ],
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Section',
  description:
    '带有背景变体的容器，用于创建视觉上可区分的区域，自动突破父容器内边距实现全宽填充。',
  features: [
    '背景变体：section、transparent 和 wash',
    '自动突破父容器内边距实现全宽填充',
    '支持在任意边的组合上设置分隔线边框（top、bottom、start、end）',
    '通过 SizeValue 灵活设置宽度、高度、最大宽度和最小高度',
    '支持 `padding={0}` 实现全宽内容',
  ],
  examples: [
    {
      label: 'Wash 变体',
      code: `<XDSSection variant="wash" width={300} height={250}>
  <XDSLayout
    content={<XDSLayoutContent>Content in wash section</XDSLayoutContent>}
  />
</XDSSection>`,
    },
    {
      label: 'Transparent 变体',
      code: `<XDSSection variant="transparent">
  <XDSLayout
    content={<XDSLayoutContent>Transparent background</XDSLayoutContent>}
  />
</XDSSection>`,
    },
    {
      label: '带分隔线',
      code: `<XDSSection variant="section" dividers={['top', 'bottom']}>
  <XDSLayout
    content={<XDSLayoutContent>Section with top and bottom borders</XDSLayoutContent>}
  />
</XDSSection>`,
    },
    {
      label: '全出血',
      code: `<XDSSection variant="wash" padding={0}>
  <XDSLayout
    content={<XDSLayoutContent>Edge-to-edge content</XDSLayoutContent>}
  />
</XDSSection>`,
    },
  ],
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
      name: 'xstyle',
      type: 'StyleXStyles',
      description: '用于布局自定义的 StyleX 样式（外边距、定位、尺寸）。必须是 stylex.create() 的值，不能是内联样式对象。',
    },
  ],
  theming: {
    targets: [
      {className: 'xds-section', visualProps: ['variant']},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'Container w/ background variants for creating visually distinct regions; auto-escapes parent container padding for edge-to-edge fills.',
  features: [
    'Background variants: section, transparent, wash',
    'Auto-escapes parent container padding for edge-to-edge fills',
    'Supports divider borders on any combination of sides (top, bottom, start, end)',
    'Flexible sizing via SizeValue for width, height, maxWidth, minHeight',
    'Full-bleed mode removes internal padding for edge-to-edge content',
  ],
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
