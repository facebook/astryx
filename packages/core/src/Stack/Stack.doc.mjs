// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Stack',
  displayName: 'Stack',
  group: 'Layout',
  category: 'Layout',
  keywords: ["stack","hstack","vstack","flexbox","flex","spacing","gap","horizontal","vertical","row","column"],
  theming: {
    targets: [
      {className: 'astryx-stack', visualProps: ['direction', 'gap', 'wrap']},
      {className: 'astryx-stack-item', visualProps: ['size']},
    ],
  },
  components: [
    {
      name: 'HStack',
      isHiddenFromOverview: true,
      displayName: 'H Stack',
      description:
        'Horizontal stack for arranging items left-to-right. Supports polymorphic rendering.',
      props: [
        {
          name: 'gap',
          type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
          description:
            'Spacing step (number literal): 0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10. Pass as a JSX number expression e.g. gap={4}, NOT a string like gap="4".',
        },
        {
          name: 'padding',
          type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
          description:
            'Inner padding on all sides, using the spacing scale (0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10). Matches the padding prop on Card, LayoutContent, and LayoutPanel. Pass as a JSX number expression e.g. padding={3}.',
        },
        {
          name: 'paddingInline',
          type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
          description:
            'Inline (horizontal) padding, using the spacing scale. Overrides padding on the inline axis when both are set.',
        },
        {
          name: 'paddingBlock',
          type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
          description:
            'Block (vertical) padding, using the spacing scale. Overrides padding on the block axis when both are set.',
        },
        {
          name: 'isScrollable',
          type: 'boolean',
          description:
            'Enables scrollable overflow (overflow: auto). Matches isScrollable on LayoutContent and LayoutPanel.',
          default: 'false',
        },
        {
          name: 'width',
          type: 'SizeValue',
          description: "Width of the stack container. Numbers are treated as pixels, strings are used as-is (e.g., '100%').",
        },
        {
          name: 'height',
          type: 'SizeValue',
          description: "Height of the stack container. Numbers are treated as pixels, strings are used as-is (e.g., '100%').",
        },
        {
          name: 'maxWidth',
          type: 'SizeValue',
          description: "Maximum width of the stack container. Numbers are treated as pixels, strings are used as-is (e.g., '100%').",
        },
        {
          name: 'minHeight',
          type: 'SizeValue',
          description: "Minimum height of the stack container. Numbers are treated as pixels, strings are used as-is (e.g., '100%').",
        },
        {
          name: 'hAlign',
          type: "'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'",
          description: 'Horizontal (main-axis) alignment of items.',
        },
        {
          name: 'vAlign',
          type: "'start' | 'center' | 'end' | 'stretch'",
          description: 'Vertical (cross-axis) alignment of items.',
          default: "'stretch'",
        },
        {
          name: 'justify',
          type: "'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'",
          description: 'Main-axis alignment alias for hAlign. Mirrors CSS justify-content.',
        },
        {
          name: 'align',
          type: "'start' | 'center' | 'end' | 'stretch'",
          description: 'Cross-axis alignment alias for vAlign. Mirrors CSS align-items.',
        },
        {
          name: 'wrap',
          type: "'nowrap' | 'wrap' | 'wrap-reverse'",
          description: 'Flex wrap behavior.',
          default: "'nowrap'",
        },
        {
          name: 'as',
          type: 'ElementType',
          description: 'HTML element to render as the stack container.',
          default: "'div'",
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: 'Stack content.',
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value, not an inline style object like style={{}}.',
        },
      ],    },
    {
      name: 'VStack',
      isHiddenFromOverview: true,
      displayName: 'V Stack',
      description:
        'Vertical stack for arranging items top-to-bottom. Supports polymorphic rendering.',
      props: [
        {
          name: 'gap',
          type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
          description:
            'Spacing step (number literal): 0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10. Pass as a JSX number expression e.g. gap={4}, NOT a string like gap="4".',
        },
        {
          name: 'padding',
          type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
          description:
            'Inner padding on all sides, using the spacing scale (0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10). Matches the padding prop on Card, LayoutContent, and LayoutPanel. Pass as a JSX number expression e.g. padding={3}.',
        },
        {
          name: 'paddingInline',
          type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
          description:
            'Inline (horizontal) padding, using the spacing scale. Overrides padding on the inline axis when both are set.',
        },
        {
          name: 'paddingBlock',
          type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
          description:
            'Block (vertical) padding, using the spacing scale. Overrides padding on the block axis when both are set.',
        },
        {
          name: 'isScrollable',
          type: 'boolean',
          description:
            'Enables scrollable overflow (overflow: auto). Matches isScrollable on LayoutContent and LayoutPanel.',
          default: 'false',
        },
        {
          name: 'width',
          type: 'SizeValue',
          description: "Width of the stack container. Numbers are treated as pixels, strings are used as-is (e.g., '100%').",
        },
        {
          name: 'height',
          type: 'SizeValue',
          description: "Height of the stack container. Numbers are treated as pixels, strings are used as-is (e.g., '100%').",
        },
        {
          name: 'maxWidth',
          type: 'SizeValue',
          description: "Maximum width of the stack container. Numbers are treated as pixels, strings are used as-is (e.g., '100%').",
        },
        {
          name: 'minHeight',
          type: 'SizeValue',
          description: "Minimum height of the stack container. Numbers are treated as pixels, strings are used as-is (e.g., '100%').",
        },
        {
          name: 'hAlign',
          type: "'start' | 'center' | 'end' | 'stretch'",
          description: 'Horizontal (cross-axis) alignment of items.',
          default: "'stretch'",
        },
        {
          name: 'vAlign',
          type: "'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'",
          description: 'Vertical (main-axis) alignment of items.',
        },
        {
          name: 'justify',
          type: "'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'",
          description: 'Main-axis alignment alias for vAlign. Mirrors CSS justify-content.',
        },
        {
          name: 'align',
          type: "'start' | 'center' | 'end' | 'stretch'",
          description: 'Cross-axis alignment alias for hAlign. Mirrors CSS align-items.',
        },
        {
          name: 'wrap',
          type: "'nowrap' | 'wrap' | 'wrap-reverse'",
          description: 'Flex wrap behavior.',
          default: "'nowrap'",
        },
        {
          name: 'as',
          type: 'ElementType',
          description: 'HTML element to render as the stack container.',
          default: "'div'",
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: 'Stack content.',
        },
      ],
    },
    {
      name: 'StackItem',
      isHiddenFromOverview: true,
      displayName: 'Stack Item',
      description:
        'Stack item for controlling individual item behavior within a stack. Supports polymorphic rendering.',
      props: [
        {
          name: 'size',
          type: "'static' | 'fill'",
          description:
            'Flex grow behavior: static keeps natural size, fill expands to consume remaining space.',
          default: "'static'",
        },
        {
          name: 'isScrollable',
          type: 'boolean',
          description:
            'Enables scrollable overflow (overflow: auto). StackItem already applies the flex min-height/min-width reset, so <StackItem size="fill" isScrollable> is a complete scroll region. Matches isScrollable on LayoutContent and LayoutPanel.',
          default: 'false',
        },
        {
          name: 'crossAlignSelf',
          type: "'start' | 'center' | 'end' | 'stretch'",
          description:
            'Override the cross-axis alignment for this individual item, ignoring the parent stack alignment.',
        },
        {
          name: 'as',
          type: 'ElementType',
          description: 'HTML element to render as the item wrapper.',
          default: "'div'",
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: 'Item content.',
        },
      ],
    },
  ],
  usage: {
    description:
      'Stack arranges items in a row or column with consistent spacing. Use the gap prop to control the space between items.',
    bestPractices: [
      { guidance: true, description: 'Use the gap prop for spacing between items; don\'t add margins manually.' },
      { guidance: true, description: 'Use StackItem with size="fill" to make one item stretch and fill the leftover space.' },
      { guidance: false, description: 'Nest stacks inside stacks; try wrap="wrap" first to let items flow to the next line.' },
    ],
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Stack',
  displayName: 'Stack',
  group: 'Layout',
  theming: {
    targets: [
      {className: 'astryx-stack', visualProps: ['direction', 'gap', 'wrap']},
      {className: 'astryx-stack-item', visualProps: ['size']},
    ],
  },
  components: [
    {
      name: 'HStack',
      isHiddenFromOverview: true,
      displayName: 'H Stack',
      description:
        '水平堆叠组件，将元素从左到右排列。支持多态渲染。',
      props: [
        {
          name: 'gap',
          type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
          description:
            '间距步进（数字字面量）：0、0.5、1、1.5、2、3、4、5、6、8、10。在 JSX 中使用数字表达式 e.g. gap={4}，不要使用字符串 gap="4"。',
        },
        {
          name: 'width',
          type: 'SizeValue',
          description: '堆叠容器的宽度。数字按像素处理，字符串原样使用（如 \'100%\'）。',
        },
        {
          name: 'height',
          type: 'SizeValue',
          description: '堆叠容器的高度。数字按像素处理，字符串原样使用（如 \'100%\'）。',
        },
        {
          name: 'hAlign',
          type: "'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'",
          description: '水平（主轴）对齐方式。',
        },
        {
          name: 'vAlign',
          type: "'start' | 'center' | 'end' | 'stretch'",
          description: '元素的垂直（交叉轴）对齐方式。',
          default: "'stretch'",
        },
        {
          name: 'justify',
          type: "'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'",
          description: 'hAlign 的别名。对应 CSS justify-content。',
        },
        {
          name: 'align',
          type: "'start' | 'center' | 'end' | 'stretch'",
          description: 'vAlign 的别名。对应 CSS align-items。',
        },
        {
          name: 'wrap',
          type: "'nowrap' | 'wrap' | 'wrap-reverse'",
          description: 'Flex 换行行为。',
          default: "'nowrap'",
        },
        {
          name: 'as',
          type: 'ElementType',
          description: '作为堆叠容器渲染的 HTML 元素。',
          default: "'div'",
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: '堆叠内容。',
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            '用于布局自定义的 StyleX 样式（外边距、定位、尺寸）。必须是 stylex.create() 的值，而非内联样式对象如 style={{}}。',
        },
      ],
    },
    {
      name: 'VStack',
      isHiddenFromOverview: true,
      displayName: 'V Stack',
      description:
        '垂直堆叠组件，将元素从上到下排列。支持多态渲染。',
      props: [
        {
          name: 'gap',
          type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
          description:
            '间距步进（数字字面量）：0、0.5、1、1.5、2、3、4、5、6、8、10。在 JSX 中使用数字表达式 e.g. gap={4}，不要使用字符串 gap="4"。',
        },
        {
          name: 'width',
          type: 'SizeValue',
          description: '堆叠容器的宽度。数字按像素处理，字符串原样使用（如 \'100%\'）。',
        },
        {
          name: 'height',
          type: 'SizeValue',
          description: '堆叠容器的高度。数字按像素处理，字符串原样使用（如 \'100%\'）。',
        },
        {
          name: 'hAlign',
          type: "'start' | 'center' | 'end' | 'stretch'",
          description: '元素的水平（交叉轴）对齐方式。',
          default: "'stretch'",
        },
        {
          name: 'vAlign',
          type: "'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'",
          description: '垂直（主轴）对齐方式。',
        },
        {
          name: 'justify',
          type: "'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'",
          description: 'vAlign 的别名。对应 CSS justify-content。',
        },
        {
          name: 'align',
          type: "'start' | 'center' | 'end' | 'stretch'",
          description: 'hAlign 的别名。对应 CSS align-items。',
        },
        {
          name: 'wrap',
          type: "'nowrap' | 'wrap' | 'wrap-reverse'",
          description: 'Flex 换行行为。',
          default: "'nowrap'",
        },
        {
          name: 'as',
          type: 'ElementType',
          description: '作为堆叠容器渲染的 HTML 元素。',
          default: "'div'",
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: '堆叠内容。',
        },
      ],
    },
    {
      name: 'StackItem',
      isHiddenFromOverview: true,
      displayName: 'Stack Item',
      description:
        '堆叠子元素，用于控制堆叠中单个元素的行为。支持多态渲染。',
      props: [
        {
          name: 'size',
          type: "'static' | 'fill'",
          description:
            'Flex 增长行为：static 保持自然尺寸，fill 扩展以占据剩余空间。',
          default: "'static'",
        },
        {
          name: 'crossAlignSelf',
          type: "'start' | 'center' | 'end' | 'stretch'",
          description:
            '覆盖此元素的交叉轴对齐方式，忽略父堆叠的对齐设置。',
        },
        {
          name: 'as',
          type: 'ElementType',
          description: '作为子元素包装器渲染的 HTML 元素。',
          default: "'div'",
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: '子元素内容。',
        },
      ],
    },
  ],
  usage: {
    description:
      'Stack arranges items in a row or column with consistent spacing. Use the gap prop to control the space between items.',
    bestPractices: [
      { guidance: true, description: 'Use the gap prop for spacing between items; don\'t add margins manually.' },
      { guidance: true, description: 'Use StackItem with size="fill" to make one item stretch and fill the leftover space.' },
      { guidance: false, description: 'Nest stacks inside stacks; try wrap="wrap" first to let items flow to the next line.' },
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'Stack layout primitives for horizontal/vertical sequences using flexbox w/ themed spacing tokens.',
  usage: {
    description:
      'Stack arranges items in a row or column with consistent spacing. Use the gap prop to control the space between items.',
    bestPractices: [
      { guidance: true, description: 'Use the gap prop for spacing between items; don\'t add margins manually.' },
      { guidance: true, description: 'Use StackItem with size="fill" to make one item stretch and fill the leftover space.' },
      { guidance: false, description: 'Nest stacks inside stacks; try wrap="wrap" first to let items flow to the next line.' },
    ],
  },
  components: [
    {
      name: 'HStack',
      isHiddenFromOverview: true,
      displayName: 'H Stack',
      description: 'Horizontal stack; left-to-right, polymorphic rendering.',
      propDescriptions: {
        gap: 'Number literal spacing step: 0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10. Use gap={4} not gap="4".',
        width: "Width of container. Numbers=pixels, strings=as-is (e.g. '100%').",
        height: "Height of container. Numbers=pixels, strings=as-is (e.g. '100%').",
        hAlign: 'Horizontal (main-axis) alignment.',
        vAlign: 'Vertical (cross-axis) alignment.',
        justify: 'Main-axis alignment alias for hAlign. Mirrors CSS justify-content.',
        align: 'Cross-axis alignment alias for vAlign. Mirrors CSS align-items.',
        wrap: 'Flex wrap behavior.',
        as: 'HTML element to render as container.',
        children: 'Stack content.',
        xstyle: 'StyleX layout styles; must be stylex.create() value.',
      },
    },
    {
      name: 'VStack',
      isHiddenFromOverview: true,
      displayName: 'V Stack',
      description: 'Vertical stack; top-to-bottom, polymorphic rendering.',
      propDescriptions: {
        gap: 'Number literal spacing step: 0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10. Use gap={4} not gap="4".',
        width: "Width of container. Numbers=pixels, strings=as-is (e.g. '100%').",
        height: "Height of container. Numbers=pixels, strings=as-is (e.g. '100%').",
        hAlign: 'Horizontal (cross-axis) alignment.',
        vAlign: 'Vertical (main-axis) alignment.',
        justify: 'Main-axis alignment alias for vAlign. Mirrors CSS justify-content.',
        align: 'Cross-axis alignment alias for hAlign. Mirrors CSS align-items.',
        wrap: 'Flex wrap behavior.',
        as: 'HTML element to render as container.',
        children: 'Stack content.',
      },
    },
    {
      name: 'StackItem',
      isHiddenFromOverview: true,
      displayName: 'Stack Item',
      description: 'Controls individual item behavior in stack; polymorphic rendering.',
      propDescriptions: {
        size: 'Flex grow: static=natural size, fill=expand to remaining space.',
        crossAlignSelf: 'Override cross-axis alignment for this item, ignoring parent.',
        as: 'HTML element to render as wrapper.',
        children: 'Item content.',
      },
    },
  ],
};