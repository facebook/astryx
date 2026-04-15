/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Skeleton',
  description:
    'A placeholder loading component that displays an animated pulsing effect while content is loading.',
  showcase: {
    aspectRatio: 4 / 3,
    code: '<XDSSkeleton />',
  },
  keywords: ["skeleton","placeholder","loading","shimmer","pulse","loader","bone","ghost","preloader"],
  features: [
    'Pulsing Animation: Smooth opacity animation using stepped timing for a subtle shimmer effect',
    'Staggered Animation: Sequential skeletons can be staggered to create a wave effect',
    'High Contrast Support: Automatically adjusts for users with prefers-contrast: more',
    'Flexible Sizing: Width and height props accept pixels or any CSS value',
    'Token-aligned Radius: Border radius options map directly to design tokens',
  ],
  props: [
    {
      name: 'width',
      type: 'number | string',
      description: 'Width in pixels (number) or CSS value (string).',
      default: "'100%'",
    },
    {
      name: 'height',
      type: 'number | string',
      description: 'Height in pixels (number) or CSS value (string).',
      default: "'100%'",
    },
    {
      name: 'radius',
      type: "'none' | 0 | 1 | 2 | 3 | 4 | 'rounded'",
      description: 'Border radius using design token scale. Use none for sharp corners, rounded for fully rounded (avatars, pills, circles).',
      default: '3',
    },
    {
      name: 'index',
      type: 'number',
      description:
        'Index for staggered animation timing. For element at index n, animation starts at DELAY_TIME + (STAGGER_TIME × n).',
      default: '0',
    },
  ],  theming: {
    targets: [
      {className: 'xds-skeleton'},
    ],
  },
  notes: [
    'Uses steps(10, end) timing function for a subtle shimmer effect.',
    'Animation alternates between 0.25 and 1.0 opacity.',
    'Background color comes from the glimmer token, with glimmerHighContrast for accessibility.',
    'Numeric dimensions are converted to pixels; strings are passed through as-is.',
    'Animation timing constants: DELAY_TIME (1000ms) initial delay before animation starts, FADE_TIME (1000ms) duration of one opacity cycle, STAGGER_TIME (100ms) delay increment between sequential elements.',
  ],
  usage: {
    summary: 'A placeholder loading component that displays an animated pulsing effect while content is loading.',
    content: `## When to use

- Content of known size is loading.
- Building skeleton screens that match the layout of the content being loaded.

## When NOT to use

- Content dimensions are unknown (use Spinner instead).`,
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Skeleton',
  description:
    '占位加载组件，在内容加载时显示动画脉冲效果。',
  features: [
    '脉冲动画：使用分步计时的平滑透明度动画，呈现细腻的闪烁效果',
    '交错动画：连续的骨架屏可以交错排列以创建波浪效果',
    '高对比度支持：自动适配 prefers-contrast: more 用户偏好',
    '灵活尺寸：宽度和高度属性接受像素值或任意 CSS 值',
    '令牌对齐圆角：边框圆角选项直接映射到设计令牌',
  ],
  props: [
    {
      name: 'width',
      type: 'number | string',
      description: '像素宽度（数字）或 CSS 值（字符串）。',
      default: "'100%'",
    },
    {
      name: 'height',
      type: 'number | string',
      description: '像素高度（数字）或 CSS 值（字符串）。',
      default: "'100%'",
    },
    {
      name: 'radius',
      type: "'none' | 0 | 1 | 2 | 3 | 4 | 'rounded'",
      description: '使用设计令牌的边框圆角。使用 none 表示直角，rounded 表示完全圆角（头像、药丸形、圆形）。',
      default: '3',
    },
    {
      name: 'index',
      type: 'number',
      description:
        '交错动画时序的索引。对于索引为 n 的元素，动画在 DELAY_TIME + (STAGGER_TIME × n) 时开始。',
      default: '0',
    },
  ],
  theming: {
    targets: [
      {className: 'xds-skeleton'},
    ],
  },
  notes: [
    '使用 steps(10, end) 计时函数实现细腻的闪烁效果。',
    '动画在 0.25 和 1.0 透明度之间交替。',
    '背景颜色来自 glimmer 令牌，无障碍场景使用 glimmerHighContrast。',
    '数字类型的尺寸会转换为像素值；字符串类型按原样传递。',
    '动画时序常量：DELAY_TIME（1000ms）动画开始前的初始延迟，FADE_TIME（1000ms）一个透明度循环的持续时间，STAGGER_TIME（100ms）连续元素之间的延迟增量。',
  ],
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'Placeholder loading component displaying animated pulsing effect while content loads.',
  features: [
    'Pulsing Animation: smooth opacity animation using stepped timing for subtle shimmer effect',
    'Staggered Animation: sequential skeletons can be staggered to create wave effect',
    'High Contrast Support: auto-adjusts for users w/ prefers-contrast: more',
    'Flexible Sizing: width + height props accept pixels or any CSS value',
    'Token-aligned Radius: border radius options map directly to design tokens',
  ],
  notes: [
    'Uses steps(10, end) timing function for subtle shimmer effect.',
    'Animation alternates between 0.25 and 1.0 opacity.',
    'Background color from glimmer token, w/ glimmerHighContrast for accessibility.',
    'Numeric dimensions converted to pixels; strings passed through as-is.',
    'Animation timing constants: DELAY_TIME (1000ms) initial delay before animation starts, FADE_TIME (1000ms) duration of one opacity cycle, STAGGER_TIME (100ms) delay increment between sequential elements.',
  ],
  propDescriptions: {
    width: 'Width in pixels (number) or CSS value (string).',
    height: 'Height in pixels (number) or CSS value (string).',
    radius: 'Border radius using design tokens. none for sharp, 0-4 for scale, rounded for pills.',
    index: 'Index for staggered animation timing. Element at index n starts at DELAY_TIME + (STAGGER_TIME \u00d7 n).',
  },
};
