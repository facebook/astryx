// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'AspectRatio',
  displayName: 'Aspect Ratio',
  category: 'Layout',
  keywords: ["aspect-ratio","ratio","proportion","responsive","embed","container","widescreen","thumbnail","letterbox","crop"],
  usage: {
    description:
      'Maintains a fixed width-to-height ratio for its children, regardless of screen size. Use it for media containers like videos, images, thumbnails, or any content that needs consistent proportions.',
    bestPractices: [
      {guidance: true, description: 'Express the ratio as a fraction like `16/9` or `4/3` for readability.'},
      {guidance: true, description: 'Use for media that needs consistent proportions across screen sizes.'},
      {guidance: true, description: 'Use `shape="ellipse"` for circular/oval media like avatars; combine with `ratio={1}` for a perfect circle.'},
      {guidance: false, description: 'Use for general layout containers — use standard layout components instead.'},
      {guidance: false, description: 'Nest AspectRatio containers — one level is sufficient.'},
    ],
  },
  props: [
    {
      name: 'ratio',
      type: 'number',
      description: 'Aspect ratio as width/height (e.g. 16/9, 1).',
      required: true,
    },
    {
      name: 'shape',
      type: "'rectangle' | 'ellipse'",
      description: 'Container shape. Both respect the `ratio`. `ellipse` clips to an oval (a circle when `ratio={1}`).',
      default: "'rectangle'",
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Content positioned absolutely to fill the container.',
      required: true,
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value — not an inline style object like style={{}}.',
    },
  ],
  playground: {
    defaults: {
      ratio: 16 / 9,
      shape: 'rectangle',
      // Fixed height + auto width lets the CSS `aspect-ratio` drive the box
      // width as the ratio knob changes (the component's base width is 100%,
      // which is why the preview was full-width regardless of the ratio).
      style: {
        height: 300,
        width: 'auto',
        backgroundColor: 'var(--color-background-blue)',
      },
      children: {
        __element: 'XDSCenter',
        props: {height: '100%'},
        children: {
          __element: 'XDSText',
          props: {color: 'primary'},
          children: 'Aspect Ratio',
        },
      },
    },
  },
  theming: {
    targets: [
      {className: 'xds-aspect-ratio', visualProps: ['shape']},
    ],
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'AspectRatio',
  displayName: 'Aspect Ratio',
  usage: {
    description:
      'Maintains a fixed width-to-height ratio for its children, regardless of screen size. Use it for media containers like videos, images, thumbnails, or any content that needs consistent proportions.',
    bestPractices: [
      {guidance: true, description: 'Express the ratio as a fraction like `16/9` or `4/3` for readability.'},
      {guidance: true, description: 'Use for media that needs consistent proportions across screen sizes.'},
      {guidance: true, description: 'Use `shape="ellipse"` for circular/oval media like avatars; combine with `ratio={1}` for a perfect circle.'},
      {guidance: false, description: 'Use for general layout containers — use standard layout components instead.'},
      {guidance: false, description: 'Nest AspectRatio containers — one level is sufficient.'},
    ],
  },
  props: [
    {name: 'ratio', type: 'number', description: '宽高比，以宽/高表示（例如 16/9、1）。', required: true},
    {name: 'shape', type: "'rectangle' | 'ellipse'", description: '容器形状，二者均遵循 `ratio`。`ellipse` 裁剪为椭圆（当 `ratio={1}` 时为圆形）。', default: "'rectangle'"},
    {name: 'children', type: 'ReactNode', description: '通过绝对定位填充容器的内容。', required: true},
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局自定义的 StyleX 样式（外边距、定位、尺寸）。必须是 stylex.create() 的值，而不是像 style={{}} 这样的内联样式对象。',
    },
  ],
  theming: {
    targets: [
      {className: 'xds-aspect-ratio', visualProps: ['shape']},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'maintains specific aspect ratio for children',
  usage: {
    description:
      'Maintains a fixed width-to-height ratio for its children, regardless of screen size. Use it for media containers like videos, images, thumbnails, or any content that needs consistent proportions.',
    bestPractices: [
      {guidance: true, description: 'Express the ratio as a fraction like `16/9` or `4/3` for readability.'},
      {guidance: true, description: 'Use for media that needs consistent proportions across screen sizes.'},
      {guidance: true, description: 'Use `shape="ellipse"` for circular/oval media like avatars; combine with `ratio={1}` for a perfect circle.'},
      {guidance: false, description: 'Use for general layout containers — use standard layout components instead.'},
      {guidance: false, description: 'Nest AspectRatio containers — one level is sufficient.'},
    ],
  },
  propDescriptions: {
    ratio: 'width/height ratio (e.g. 16/9, 1)',
    shape: "container shape: 'rectangle' (default) or 'ellipse'; both respect ratio",
    children: 'content positioned absolutely to fill container',
    xstyle: 'StyleX layout customization via stylex.create()',
  },
};
