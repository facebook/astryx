/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Center',
  keywords: ["center","centered","centering","align","alignment","justify","flexbox","middle"],
  props: [
    {
      name: 'axis',
      type: "'both' | 'horizontal' | 'vertical'",
      description: 'Which direction(s) to center.',
      default: "'both'",
    },
    {
      name: 'width',
      type: 'number | string',
      description: 'Container width (px or CSS value).',
    },
    {
      name: 'height',
      type: 'number | string',
      description: 'Container height (px or CSS value).',
    },
    {
      name: 'isInline',
      type: 'boolean',
      description: 'Use inline-flex (useful for text/icons).',
      default: 'false',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Content to center.',
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
      {className: 'xds-center', visualProps: ['axis']},
    ],
  },
  usage: {
    description:
      'Center is a layout primitive that centers its children horizontally and/or vertically using flexbox. Use it to quickly align content within a container without writing custom centering styles.',
    bestPractices: [
      {guidance: true, description: 'Use the axis prop to center only in the direction you need — avoid unnecessary centering on both axes.'},
      {guidance: true, description: 'Set isInline when centering small inline content like icons or text within a line.'},
      {guidance: false, description: 'Wrap large page sections in Center — use XDSLayout for page-level structure instead.'},
    ],
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Center',
  usage: {
    description:
      'Center is a layout primitive that centers its children horizontally and/or vertically using flexbox. Use it to quickly align content within a container without writing custom centering styles.',
    bestPractices: [
      {guidance: true, description: 'Use the axis prop to center only in the direction you need — avoid unnecessary centering on both axes.'},
      {guidance: true, description: 'Set isInline when centering small inline content like icons or text within a line.'},
      {guidance: false, description: 'Wrap large page sections in Center — use XDSLayout for page-level structure instead.'},
    ],
  },
  props: [
    {name: 'axis', type: "'both' | 'horizontal' | 'vertical'", description: '居中的方向。', default: "'both'"},
    {name: 'width', type: 'number | string', description: '容器宽度（px 或 CSS 值）。'},
    {name: 'height', type: 'number | string', description: '容器高度（px 或 CSS 值）。'},
    {name: 'isInline', type: 'boolean', description: '使用 inline-flex（适用于文本/图标）。', default: 'false'},
    {name: 'children', type: 'ReactNode', description: '要居中的内容。'},
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局自定义的 StyleX 样式（外边距、定位、尺寸）。必须是 stylex.create() 的值——不能是 style={{}} 这样的内联样式对象。',
    },
  ],
  theming: {
    targets: [
      {
        className: 'xds-center',
        visualProps: [
          'axis',
        ],
      },
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'centers children horizontally+vertically via flexbox',
  usage: {
    description:
      'Center is a layout primitive that centers its children horizontally and/or vertically using flexbox. Use it to quickly align content within a container without writing custom centering styles.',
    bestPractices: [
      {guidance: true, description: 'Use the axis prop to center only in the direction you need — avoid unnecessary centering on both axes.'},
      {guidance: true, description: 'Set isInline when centering small inline content like icons or text within a line.'},
      {guidance: false, description: 'Wrap large page sections in Center — use XDSLayout for page-level structure instead.'},
    ],
  },
  propDescriptions: {
    axis: 'centering direction(s)',
    width: 'container width (px or CSS)',
    height: 'container height (px or CSS)',
    isInline: 'use inline-flex for text/icons',
    children: 'content to center',
    xstyle: 'StyleX styles for layout (margins, positioning, sizing); must be stylex.create() value',
  },
};
