/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Stack',
  group: 'Stack',
  keywords: ["stack","hstack","vstack","flexbox","flex","spacing","gap","horizontal","vertical","row","column"],
  theming: {
    targets: [
      {className: 'xds-stack', visualProps: ['direction', 'gap', 'wrap']},
      {className: 'xds-stack-item', visualProps: ['size']},
    ],
  },
  components: [
    {
      name: 'XDSHStack',
      description:
        'Horizontal stack for arranging items left-to-right. Supports polymorphic rendering.',
      props: [
        {
          name: 'gap',
          type: 'SpacingStep',
          description:
            'Numeric spacing step controlling the gap between items: 0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10.',
        },
        {
          name: 'vAlign',
          type: "'start' | 'center' | 'end' | 'stretch'",
          description: 'Vertical (cross-axis) alignment of items.',
          default: "'stretch'",
        },
        {
          name: 'wrap',
          type: "'nowrap' | 'wrap' | 'wrap-reverse'",
          description: 'Flex wrap behavior.',
          default: "'nowrap'",
        },
        {
          name: 'element',
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
            'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value — not an inline style object like style={{}}.',
        },
      ],    },
    {
      name: 'XDSVStack',
      description:
        'Vertical stack for arranging items top-to-bottom. Supports polymorphic rendering.',
      props: [
        {
          name: 'gap',
          type: 'SpacingStep',
          description:
            'Numeric spacing step controlling the gap between items: 0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10.',
        },
        {
          name: 'hAlign',
          type: "'start' | 'center' | 'end' | 'stretch'",
          description: 'Horizontal (cross-axis) alignment of items.',
          default: "'stretch'",
        },
        {
          name: 'wrap',
          type: "'nowrap' | 'wrap' | 'wrap-reverse'",
          description: 'Flex wrap behavior.',
          default: "'nowrap'",
        },
        {
          name: 'element',
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
      name: 'XDSStackItem',
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
          name: 'crossAlignSelf',
          type: "'start' | 'center' | 'end' | 'stretch'",
          description:
            'Override the cross-axis alignment for this individual item, ignoring the parent stack alignment.',
        },
        {
          name: 'element',
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
    {
      name: 'stack',
      description:
        'Low-level StyleX utility for creating flex containers with stack behavior. Use when the component API is insufficient.',
      props: [
        {
          name: 'direction',
          type: "'horizontal' | 'vertical'",
          description: 'Stack direction.',
          required: true,
        },
        {
          name: 'gap',
          type: 'SpacingStep',
          description:
            'Numeric spacing step controlling the gap between items: 0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10.',
        },
        {
          name: 'crossAlign',
          type: "'start' | 'center' | 'end' | 'stretch'",
          description: 'Cross-axis alignment of all items.',
        },
        {
          name: 'wrap',
          type: "'nowrap' | 'wrap' | 'wrap-reverse'",
          description: 'Flex wrap behavior.',
          default: "'nowrap'",
        },
      ],
    },
    {
      name: 'stackItem',
      description:
        'Low-level StyleX utility for controlling flex item behavior. Use when the component API is insufficient.',
      props: [
        {
          name: 'size',
          type: "'static' | 'fill'",
          description:
            'Flex grow behavior: static keeps natural size, fill expands to consume remaining space.',
          default: "'static'",
        },
        {
          name: 'crossAlignSelf',
          type: "'start' | 'center' | 'end' | 'stretch'",
          description:
            'Override the cross-axis alignment for this individual item.',
        },
      ],
    },
  ],
  usage: {
    description:
      'Stack arranges items in a row or column with consistent spacing. Use the gap prop to control the space between items.',
    bestPractices: [
      { guidance: true, description: 'Use the gap prop for spacing between items — don\'t add margins manually.' },
      { guidance: true, description: 'Use XDSStackItem with size="fill" to make one item stretch and fill the leftover space.' },
      { guidance: false, description: 'Nest stacks inside stacks — try wrap="wrap" first to let items flow to the next line.' },
    ],
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Stack',
  group: 'Stack',
  theming: {
    targets: [
      {className: 'xds-stack', visualProps: ['direction', 'gap', 'wrap']},
      {className: 'xds-stack-item', visualProps: ['size']},
    ],
  },
  components: [
    {
      name: 'XDSHStack',
      description:
        '水平堆叠组件，将元素从左到右排列。支持多态渲染。',
      props: [
        {
          name: 'gap',
          type: 'SpacingStep',
          description:
            '控制元素间距的数值间距步进：0、0.5、1、1.5、2、3、4、5、6、8、10。',
        },
        {
          name: 'vAlign',
          type: "'start' | 'center' | 'end' | 'stretch'",
          description: '元素的垂直（交叉轴）对齐方式。',
          default: "'stretch'",
        },
        {
          name: 'wrap',
          type: "'nowrap' | 'wrap' | 'wrap-reverse'",
          description: 'Flex 换行行为。',
          default: "'nowrap'",
        },
        {
          name: 'element',
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
      name: 'XDSVStack',
      description:
        '垂直堆叠组件，将元素从上到下排列。支持多态渲染。',
      props: [
        {
          name: 'gap',
          type: 'SpacingStep',
          description:
            '控制元素间距的数值间距步进：0、0.5、1、1.5、2、3、4、5、6、8、10。',
        },
        {
          name: 'hAlign',
          type: "'start' | 'center' | 'end' | 'stretch'",
          description: '元素的水平（交叉轴）对齐方式。',
          default: "'stretch'",
        },
        {
          name: 'wrap',
          type: "'nowrap' | 'wrap' | 'wrap-reverse'",
          description: 'Flex 换行行为。',
          default: "'nowrap'",
        },
        {
          name: 'element',
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
      name: 'XDSStackItem',
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
          name: 'element',
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
    {
      name: 'stack',
      description:
        '底层 StyleX 工具函数，用于创建具有堆叠行为的 flex 容器。在组件 API 无法满足需求时使用。',
      props: [
        {
          name: 'direction',
          type: "'horizontal' | 'vertical'",
          description: '堆叠方向。',
          required: true,
        },
        {
          name: 'gap',
          type: 'SpacingStep',
          description:
            '控制元素间距的数值间距步进：0、0.5、1、1.5、2、3、4、5、6、8、10。',
        },
        {
          name: 'crossAlign',
          type: "'start' | 'center' | 'end' | 'stretch'",
          description: '所有元素的交叉轴对齐方式。',
        },
        {
          name: 'wrap',
          type: "'nowrap' | 'wrap' | 'wrap-reverse'",
          description: 'Flex 换行行为。',
          default: "'nowrap'",
        },
      ],
    },
    {
      name: 'stackItem',
      description:
        '底层 StyleX 工具函数，用于控制 flex 子元素的行为。在组件 API 无法满足需求时使用。',
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
            '覆盖此元素的交叉轴对齐方式。',
        },
      ],
    },
  ],
  usage: {
    description:
      'Stack arranges items in a row or column with consistent spacing. Use the gap prop to control the space between items.',
    bestPractices: [
      { guidance: true, description: 'Use the gap prop for spacing between items — don\'t add margins manually.' },
      { guidance: true, description: 'Use XDSStackItem with size="fill" to make one item stretch and fill the leftover space.' },
      { guidance: false, description: 'Nest stacks inside stacks — try wrap="wrap" first to let items flow to the next line.' },
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
      { guidance: true, description: 'Use the gap prop for spacing between items — don\'t add margins manually.' },
      { guidance: true, description: 'Use XDSStackItem with size="fill" to make one item stretch and fill the leftover space.' },
      { guidance: false, description: 'Nest stacks inside stacks — try wrap="wrap" first to let items flow to the next line.' },
    ],
  },
  components: [
    {
      name: 'XDSHStack',
      description: 'Horizontal stack; left-to-right, polymorphic rendering.',
      propDescriptions: {
        gap: 'Numeric spacing step for gap: 0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10.',
        vAlign: 'Vertical (cross-axis) alignment.',
        wrap: 'Flex wrap behavior.',
        element: 'HTML element to render as container.',
        children: 'Stack content.',
        xstyle: 'StyleX layout styles; must be stylex.create() value.',
      },
    },
    {
      name: 'XDSVStack',
      description: 'Vertical stack; top-to-bottom, polymorphic rendering.',
      propDescriptions: {
        gap: 'Numeric spacing step for gap: 0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10.',
        hAlign: 'Horizontal (cross-axis) alignment.',
        wrap: 'Flex wrap behavior.',
        element: 'HTML element to render as container.',
        children: 'Stack content.',
      },
    },
    {
      name: 'XDSStackItem',
      description: 'Controls individual item behavior in stack; polymorphic rendering.',
      propDescriptions: {
        size: 'Flex grow: static=natural size, fill=expand to remaining space.',
        crossAlignSelf: 'Override cross-axis alignment for this item, ignoring parent.',
        element: 'HTML element to render as wrapper.',
        children: 'Item content.',
      },
    },
    {
      name: 'stack',
      description: 'Low-level StyleX utility for flex containers w/ stack behavior.',
      propDescriptions: {
        direction: 'Stack direction.',
        gap: 'Numeric spacing step for gap: 0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10.',
        crossAlign: 'Cross-axis alignment of all items.',
        wrap: 'Flex wrap behavior.',
      },
    },
    {
      name: 'stackItem',
      description: 'Low-level StyleX utility for flex item behavior.',
      propDescriptions: {
        size: 'Flex grow: static=natural size, fill=expand to remaining space.',
        crossAlignSelf: 'Override cross-axis alignment for this item.',
      },
    },
  ],
};