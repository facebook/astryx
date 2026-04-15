/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Spinner',
  description:
    'An animated loading indicator with optional visible label.',
  showcase: {
    aspectRatio: 1,
    code: '<XDSSpinner label="Loading" />',
  },
  keywords: ["spinner","loader","loading","circular","progress","spin","activity","busy","indeterminate"],
  features: [
    'Canvas Animation: Lightweight canvas-based spinner with smooth 360° rotation',
    'Size Variants: Three sizes (sm, md, lg) matching existing inline spinners',
    'Shade Support: Default shade for light backgrounds, onMedia for dark/accent backgrounds',
    'Label: Optional visible label (string or ReactNode) displayed below spinner',
    'Accessible: role="status" with aria-label; defaults to label text or "Loading"',
  ],
  props: [
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: 'Spinner size (10px, 14px, 18px).',
      default: "'md'",
    },
    {
      name: 'shade',
      type: "'default' | 'onMedia'",
      description: 'Color shade for light or dark backgrounds.',
      default: "'default'",
    },
    {
      name: 'label',
      type: 'ReactNode',
      description:
        'Visible content below the spinner. String labels auto-set aria-label.',
    },
    {
      name: 'aria-label',
      type: 'string',
      description:
        'Accessible name for screen readers. Defaults to label (if string) or "Loading".',
      default: "'Loading'",
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value — not an inline style object like style={{}}.',
    },
  ],  theming: {
    targets: [
      {className: 'xds-spinner', visualProps: ['size', 'shade']},
    ],
  },
  notes: [
    'Uses CSS border technique: three visible borders + one transparent for the gap.',
    'Animation: rotate(360deg) at 0.75s linear infinite.',
    'Color inherits from currentColor, controlled by shade styles using theme tokens.',
    'Element is a <span> with display: inline-block for inline composability.',
    'XDSSpinner is intentionally minimal — compose with layout and text components for full loading states.',
    'Size reference: sm = 10×10px / 3px border, md = 14×14px / 3px border, lg = 18×18px / 3px border.',
  ],
  usage: {
    summary: 'An animated loading indicator for indeterminate wait states.',
    content: `## When to use

- Indicating an ongoing process with unknown duration.
- Inline loading states within buttons or other components.

## When NOT to use

- Content of known size is loading (use Skeleton instead).`,
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Spinner',
  description:
    '带有可选可见标签的动画加载指示器。',
  features: [
    'Canvas 动画：基于 Canvas 的轻量级旋转器，平滑 360° 旋转',
    '尺寸变体：三种尺寸（sm、md、lg），与现有内联旋转器匹配',
    '色调支持：默认色调用于浅色背景，onMedia 用于深色/强调色背景',
    '标签：可选可见标签（字符串或 ReactNode），显示在旋转器下方',
    '无障碍：role="status" 与 aria-label；默认为标签文本或 "Loading"',
  ],
  props: [
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: '旋转器尺寸（10px、14px、18px）。',
      default: "'md'",
    },
    {
      name: 'shade',
      type: "'default' | 'onMedia'",
      description: '浅色或深色背景的颜色色调。',
      default: "'default'",
    },
    {
      name: 'label',
      type: 'ReactNode',
      description: '旋转器下方的可见内容。字符串标签自动设置 aria-label。',
    },
    {
      name: 'aria-label',
      type: 'string',
      description: '屏幕阅读器的无障碍名称。默认为 label（如果是字符串）或 "Loading"。',
      default: "'Loading'",
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX 样式，用于布局自定义（边距、定位、尺寸）。必须是 stylex.create() 的值，而非内联样式对象如 style={{}}。',
    },
  ],
  theming: {
    targets: [
      {className: 'xds-spinner', visualProps: ['size', 'shade']},
    ],
  },
  notes: [
    '使用 CSS 边框技术：三条可见边框 + 一条透明边框形成缺口。',
    '动画：rotate(360deg)，0.75s linear infinite。',
    '颜色继承自 currentColor，通过使用主题令牌的色调样式控制。',
    '元素是一个 <span>，设置 display: inline-block 以支持内联组合。',
    'XDSSpinner 设计上保持最小化——与布局和文本组件组合以实现完整的加载状态。',
    '尺寸参考：sm = 10×10px / 3px 边框，md = 14×14px / 3px 边框，lg = 18×18px / 3px 边框。',
  ],
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'Animated loading indicator w/ optional visible label.',
  features: [
    'Canvas animation: lightweight canvas-based spinner w/ smooth 360\u00b0 rotation',
    'Size variants: sm (10px), md (14px), lg (18px) matching inline spinners',
    'Shade support: default for light bg, onMedia for dark/accent bg',
    'Label: optional ReactNode below spinner; string labels auto-set aria-label',
    'Accessible: role="status" + aria-label; defaults to label text or "Loading"',
  ],
  notes: [
    'Canvas renders spinner arcs at device pixel ratio.',
    'Animation: rotate(360deg) at 0.75s linear infinite.',
    'Color resolved from CSS custom properties via getComputedStyle.',
    'Element is <span> w/ display: inline-block for inline composability.',
    'label + aria-label are independent props; compose, never conflict.',
    'Size ref: sm=10x10px/3px border, md=14x14px/3px border, lg=18x18px/3px border.',
  ],
  propDescriptions: {
    size: 'Spinner size (10px, 14px, 18px).',
    shade: 'Color shade for light or dark backgrounds.',
    label: 'Visible content below spinner. String auto-sets aria-label.',
    'aria-label': 'A11y name for screen readers. Defaults to label or "Loading".',
    xstyle: 'StyleX styles for layout customization. Must be stylex.create() value, not inline style.',
  },
};