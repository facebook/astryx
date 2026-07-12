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
      {guidance: true, description: 'Use `fit="cover"` for images and video so the component sizes the child; the child should not repeat `width`/`height`/`objectFit` styles.'},
      {guidance: true, description: 'For a breakpoint-dependent ratio, override the ratio responsively: pass an `aspectRatio` rule via `xstyle` (StyleX), or set the `--astryx-aspect-ratio` CSS variable on the element under a `@media`/`@container` rule. The `ratio` prop is the fallback.'},
      {guidance: false, description: 'Use for general layout containers; use standard layout components instead.'},
      {guidance: false, description: 'Nest AspectRatio containers; one level is sufficient.'},
    ],
  },
  props: [
    {
      name: 'ratio',
      type: 'number',
      description: 'Aspect ratio as width/height (e.g. 16/9, 1). Emitted as a class-level `aspect-ratio: var(--astryx-aspect-ratio, <ratio>)` declaration (never inline), so `xstyle` rules or the `--astryx-aspect-ratio` variable can override it responsively.',
      required: true,
    },
    {
      name: 'shape',
      type: "'rectangle' | 'ellipse'",
      description: 'Container shape. Both respect the `ratio`. `ellipse` clips to an oval (a circle when `ratio={1}`).',
      default: "'rectangle'",
    },
    {
      name: 'fit',
      type: "'cover' | 'contain' | 'center'",
      description: 'How the child is sized inside the ratio box. `cover` fills and crops media, `contain` fills and letterboxes, `center` keeps the natural size centered. When omitted, the child styles itself.',
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
        'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value, not an inline style object like style={{}}.',
    },
  ],
  playground: {
    defaults: {
      ratio: 16 / 9,
      children: {__element: 'Center', props: {height: '100%'}, children: {__element: 'Text', props: {color: 'secondary'}, children: '16:9'}},
    },
  },
  theming: {
    targets: [
      {className: 'astryx-aspect-ratio', visualProps: ['shape']},
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
      {guidance: true, description: 'Use `fit="cover"` for images and video so the component sizes the child; the child should not repeat `width`/`height`/`objectFit` styles.'},
      {guidance: true, description: 'For a breakpoint-dependent ratio, override the ratio responsively: pass an `aspectRatio` rule via `xstyle` (StyleX), or set the `--astryx-aspect-ratio` CSS variable on the element under a `@media`/`@container` rule. The `ratio` prop is the fallback.'},
      {guidance: false, description: 'Use for general layout containers; use standard layout components instead.'},
      {guidance: false, description: 'Nest AspectRatio containers; one level is sufficient.'},
    ],
  },
  props: [
    {name: 'ratio', type: 'number', description: '宽高比，以宽/高表示（例如 16/9、1）。以类级 `aspect-ratio: var(--astryx-aspect-ratio, <ratio>)` 声明输出（非内联样式），可通过 `xstyle` 规则或 `--astryx-aspect-ratio` 变量做响应式覆盖。', required: true},
    {
      name: 'shape',
      type: "'rectangle' | 'ellipse'",
      description: '容器形状。两种形状都遵循 `ratio`。`ellipse` 裁剪为椭圆（`ratio={1}` 时为正圆）。',
      default: "'rectangle'",
    },
    {
      name: 'fit',
      type: "'cover' | 'contain' | 'center'",
      description: '子元素在比例框内的布局方式。`cover` 填满并裁剪媒体，`contain` 填满并留边，`center` 保持原始尺寸居中。省略时子元素自行设置样式。',
    },
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
      {className: 'astryx-aspect-ratio', visualProps: ['shape']},
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
      {guidance: true, description: 'Use `fit="cover"` for images and video so the component sizes the child; the child should not repeat `width`/`height`/`objectFit` styles.'},
      {guidance: true, description: 'For a breakpoint-dependent ratio, override the ratio responsively: pass an `aspectRatio` rule via `xstyle` (StyleX), or set the `--astryx-aspect-ratio` CSS variable on the element under a `@media`/`@container` rule. The `ratio` prop is the fallback.'},
      {guidance: false, description: 'Use for general layout containers; use standard layout components instead.'},
      {guidance: false, description: 'Nest AspectRatio containers; one level is sufficient.'},
    ],
  },
  propDescriptions: {
    ratio: 'width/height ratio (e.g. 16/9, 1); class-level var(--astryx-aspect-ratio, <ratio>) so xstyle/@container overrides win',
    shape: "container shape: 'rectangle' (default) | 'ellipse' (circle at ratio 1)",
    fit: "child layout: 'cover' fill+crop | 'contain' fill+letterbox | 'center' natural size; omitted = child styles itself",
    children: 'content positioned absolutely to fill container',
    xstyle: 'StyleX layout customization via stylex.create()',
  },
};
