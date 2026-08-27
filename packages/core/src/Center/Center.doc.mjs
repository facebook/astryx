// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'Center',
  displayName: 'Center',
  group: 'Layout',
  category: 'Layout',
  isHiddenFromOverview: true,
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
      type: 'SizeValue',
      description: 'Container width (px or CSS value).',
    },
    {
      name: 'height',
      type: 'SizeValue',
      description: 'Container height (px or CSS value).',
    },
    {
      name: 'maxWidth',
      type: 'SizeValue',
      description: 'Maximum container width (px or CSS value).',
    },
    {
      name: 'minHeight',
      type: 'SizeValue',
      description: 'Minimum container height (px or CSS value).',
    },
    {
      name: 'padding',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description:
        'Inner padding on all sides, using the spacing scale (0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10). Matches the padding prop on Stack, Card, LayoutContent, and LayoutPanel. Pass as a JSX number expression e.g. padding={3}.',
    },
    {
      name: 'paddingInline',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description:
        'Inline (horizontal) padding, using the spacing scale. Overrides padding on the inline axis when both are set.',
    },
    {
      name: 'paddingInlineStart',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description:
        'Inline-start padding, using the spacing scale (left in LTR, right in RTL). Overrides paddingInline and padding on that edge only.',
    },
    {
      name: 'paddingInlineEnd',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description:
        'Inline-end padding, using the spacing scale (right in LTR, left in RTL). Overrides paddingInline and padding on that edge only.',
    },
    {
      name: 'paddingBlock',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description:
        'Block (vertical) padding, using the spacing scale. Overrides padding on the block axis when both are set.',
    },
    {
      name: 'paddingBlockStart',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description:
        'Block-start (top) padding, using the spacing scale. Overrides paddingBlock and padding on that edge only.',
    },
    {
      name: 'paddingBlockEnd',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description:
        'Block-end (bottom) padding, using the spacing scale. Overrides paddingBlock and padding on that edge only.',
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
        'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value, not an inline style object like style={{}}.',
    },
  ],
  theming: {
    targets: [
      {className: 'astryx-center', visualProps: ['axis']},
    ],
  },
  usage: {
    description:
      'Center aligns content to the middle of its container. Use it for empty states, loading screens, login forms, or any content that should sit in the center of the available space.',
    bestPractices: [
      {guidance: true, description: 'Use axis="horizontal" or axis="vertical" when you only need one direction. Both axes is the default but not always needed.'},
      {guidance: true, description: 'Set a height when centering vertically. Center needs a defined height to know what space to center within.'},
      {guidance: true, description: 'Use isInline to center small elements like icons or badges within a line of text without breaking the text flow.'},
      {guidance: false, description: 'Wrap large page sections in Center. Use Layout or AppShell for page-level structure.'},
      {guidance: false, description: 'Use Center for horizontal lists of items. Use Stack with hAlign="center" instead.'},
    ],
    anatomy: [
      {name: 'Container', required: true, description: 'A flexbox wrapper that aligns its children to the center along the chosen axis.'},
      {name: 'Content', required: true, description: 'Any children passed to Center. Typically a card, form, spinner, or empty state message.'},
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docsZh = {
  name: 'Center',
  displayName: 'Center',
  usage: {
    description:
      'Center aligns content to the middle of its container. Use it for empty states, loading screens, login forms, or any content that should sit in the center of the available space.',
    bestPractices: [
      {guidance: true, description: 'Use axis="horizontal" or axis="vertical" when you only need one direction. Both axes is the default but not always needed.'},
      {guidance: true, description: 'Set a height when centering vertically. Center needs a defined height to know what space to center within.'},
      {guidance: true, description: 'Use isInline to center small elements like icons or badges within a line of text without breaking the text flow.'},
      {guidance: false, description: 'Wrap large page sections in Center. Use Layout or AppShell for page-level structure.'},
      {guidance: false, description: 'Use Center for horizontal lists of items. Use Stack with hAlign="center" instead.'},
    ],
  },
  props: [
    {name: 'axis', type: "'both' | 'horizontal' | 'vertical'", description: '居中的方向。', default: "'both'"},
    {name: 'width', type: 'number | string', description: '容器宽度（px 或 CSS 值）。'},
    {name: 'height', type: 'number | string', description: '容器高度（px 或 CSS 值）。'},
    {
      name: 'padding',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description:
        '所有方向的内边距，使用间距刻度（0、0.5、1、1.5、2、3、4、5、6、8、10）。与 Stack、Card、LayoutContent 和 LayoutPanel 的 padding 属性一致。在 JSX 中使用数字表达式 e.g. padding={3}。',
    },
    {
      name: 'paddingInline',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description: '行内（水平）内边距，使用间距刻度。两者同时设置时在行内轴上覆盖 padding。',
    },
    {
      name: 'paddingInlineStart',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description: '行内起始内边距，使用间距刻度（LTR 中为左侧，RTL 中为右侧）。仅在该边上覆盖 paddingInline 和 padding。',
    },
    {
      name: 'paddingInlineEnd',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description: '行内结束内边距，使用间距刻度（LTR 中为右侧，RTL 中为左侧）。仅在该边上覆盖 paddingInline 和 padding。',
    },
    {
      name: 'paddingBlock',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description: '块（垂直）内边距，使用间距刻度。两者同时设置时在块轴上覆盖 padding。',
    },
    {
      name: 'paddingBlockStart',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description: '块起始（顶部）内边距，使用间距刻度。仅在该边上覆盖 paddingBlock 和 padding。',
    },
    {
      name: 'paddingBlockEnd',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description: '块结束（底部）内边距，使用间距刻度。仅在该边上覆盖 paddingBlock 和 padding。',
    },
    {name: 'isInline', type: 'boolean', description: '使用 inline-flex（适用于文本/图标）。', default: 'false'},
    {name: 'children', type: 'ReactNode', description: '要居中的内容。'},
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局自定义的 StyleX 样式（外边距、定位、尺寸）。必须是 stylex.create() 的值，不能是 style={{}} 这样的内联样式对象。',
    },
  ],
  theming: {
    targets: [
      {
        className: 'astryx-center',
        visualProps: [
          'axis',
        ],
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description: 'centers content horizontally and/or vertically via flexbox',
  usage: {
    description:
      'Center aligns content to the middle of its container. Use for empty states, loading screens, login forms.',
    bestPractices: [
      {guidance: true, description: 'Use axis="horizontal" or axis="vertical" when you only need one direction. Both axes is the default but not always needed.'},
      {guidance: true, description: 'Set a height when centering vertically. Center needs a defined height to know what space to center within.'},
      {guidance: true, description: 'Use isInline to center small elements (icons, badges) within a line of text without breaking text flow.'},
      {guidance: false, description: 'Wrap large page sections in Center. Use Layout or AppShell for page-level structure.'},
      {guidance: false, description: 'Use Center for horizontal lists of items. Use Stack with hAlign="center" instead.'},
    ],
  },
  propDescriptions: {
    axis: 'centering direction(s)',
    width: 'container width (px or CSS)',
    height: 'container height (px or CSS)',
    padding:
      'inner padding on all sides (spacing step: 0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10)',
    paddingInline: 'inline (horizontal) padding; overrides padding on that axis',
    paddingInlineStart: 'inline-start padding (left in LTR); overrides paddingInline/padding on that edge',
    paddingInlineEnd: 'inline-end padding (right in LTR); overrides paddingInline/padding on that edge',
    paddingBlock: 'block (vertical) padding; overrides padding on that axis',
    paddingBlockStart: 'block-start (top) padding; overrides paddingBlock/padding on that edge',
    paddingBlockEnd: 'block-end (bottom) padding; overrides paddingBlock/padding on that edge',
    isInline: 'use inline-flex for text/icons',
    children: 'content to center',
    xstyle: 'StyleX styles for layout (margins, positioning, sizing); must be stylex.create() value',
  },
};
