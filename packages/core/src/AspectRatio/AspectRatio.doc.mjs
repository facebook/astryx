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
      {guidance: true, description: 'Use `isCircle` for circular media like avatars; it forces a 1:1 ratio and clips to a circle.'},
      {guidance: false, description: 'Use for general layout containers — use standard layout components instead.'},
      {guidance: false, description: 'Nest AspectRatio containers — one level is sufficient.'},
    ],
  },
  props: [
    {
      name: 'ratio',
      type: 'number',
      description: 'Aspect ratio as width/height (e.g. 16/9, 1). Optional when `isCircle` is set.',
      required: false,
    },
    {
      name: 'isCircle',
      type: 'boolean',
      description: 'Clip the container into a circle (forces a 1:1 ratio with a fully rounded border). Ignores `ratio` when set.',
      default: 'false',
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
      {className: 'xds-aspect-ratio'},
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
      {guidance: false, description: 'Use for general layout containers — use standard layout components instead.'},
      {guidance: false, description: 'Nest AspectRatio containers — one level is sufficient.'},
    ],
  },
  props: [
    {name: 'ratio', type: 'number', description: '宽高比，以宽/高表示（例如 16/9、1）。设置 `isCircle` 时可选。', required: false},
    {name: 'isCircle', type: 'boolean', description: '将容器裁剪为圆形（强制 1:1 比例并应用完全圆角）。设置后将忽略 `ratio`。', default: 'false'},
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
      {className: 'xds-aspect-ratio'},
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
      {guidance: false, description: 'Use for general layout containers — use standard layout components instead.'},
      {guidance: false, description: 'Nest AspectRatio containers — one level is sufficient.'},
    ],
  },
  propDescriptions: {
    ratio: 'width/height ratio (e.g. 16/9, 1); optional when isCircle is set',
    isCircle: 'clip container to a circle (forces 1:1, ignores ratio)',
    children: 'content positioned absolutely to fill container',
    xstyle: 'StyleX layout customization via stylex.create()',
  },
};
