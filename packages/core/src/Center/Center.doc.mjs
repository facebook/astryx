/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Center',
  description: 'Centers children horizontally and/or vertically using flexbox.',
  showcase: {
    aspectRatio: 1,
    code: '<XDSCenter>Centered</XDSCenter>',
  },
  keywords: ["center","centered","centering","align","alignment","justify","flexbox","middle"],
  features: [
    'Supports centering on both axes, horizontal only, or vertical only',
    'Inline-flex mode for centering inline content such as text and icons',
    'Accepts explicit width and height to size the container',
  ],
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
    summary: 'Centers children horizontally and/or vertically using flexbox.',
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Center',
  description: '使用 flexbox 将子元素水平和/或垂直居中。',
  features: [
    '支持双轴居中、仅水平居中或仅垂直居中',
    '内联 flex 模式，用于居中文本和图标等内联内容',
    '接受显式的宽度和高度来设置容器尺寸',
  ],
  props: [
    {
      name: 'axis',
      type: "'both' | 'horizontal' | 'vertical'",
      description: '居中的方向。',
      default: "'both'",
    },
    {
      name: 'width',
      type: 'number | string',
      description: '容器宽度（px 或 CSS 值）。',
    },
    {
      name: 'height',
      type: 'number | string',
      description: '容器高度（px 或 CSS 值）。',
    },
    {
      name: 'isInline',
      type: 'boolean',
      description: '使用 inline-flex（适用于文本/图标）。',
      default: 'false',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: '要居中的内容。',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局自定义的 StyleX 样式（外边距、定位、尺寸）。必须是 stylex.create() 的值——不能是 style={{}} 这样的内联样式对象。',
    },
  ],
  theming: {
    targets: [
      {className: 'xds-center', visualProps: ['axis']},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'centers children horizontally+vertically via flexbox',
  features: [
    'centering on both axes, horizontal only, or vertical only',
    'inline-flex mode for inline content like text+icons',
    'accepts explicit width+height to size container',
  ],
  propDescriptions: {
    axis: 'centering direction(s)',
    width: 'container width (px or CSS)',
    height: 'container height (px or CSS)',
    isInline: 'use inline-flex for text/icons',
    children: 'content to center',
    xstyle: 'StyleX styles for layout (margins, positioning, sizing); must be stylex.create() value',
  },
};
