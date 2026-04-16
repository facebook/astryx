/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Carousel',
  keywords: ['carousel', 'slider', 'scroll', 'gallery', 'filmstrip', 'swiper', 'horizontal', 'overflow', 'snap'],
  usage: {
    description:
      'Carousel is a horizontal scroll container with fade-edge overflow indication and optional navigation buttons. Use to present a set of items that exceeds the available width, such as a gallery or filmstrip of cards.',
    bestPractices: [
      {guidance: true, description: 'Enable scroll-snap when each item should be viewed individually rather than as a continuous strip.'},
      {guidance: true, description: 'Provide a descriptive aria-label so assistive technology users understand the carousel\'s content.'},
      {guidance: false, description: 'Use a carousel for critical content that users must see — not all users scroll horizontally.'},
      {guidance: false, description: 'Auto-advance carousel items — let the user control scrolling at their own pace.'},
    ],
  },
  props: [
    {name: 'children', type: 'ReactNode', description: 'Carousel items rendered in a horizontal scroll container.', required: true},
    {name: 'gap', type: "0 | 0.5 | 1 | 1.5 | 2 | 3 | 4", description: 'Gap between items using the spacing token scale.', default: '1'},
    {name: 'hasButtons', type: 'boolean', description: 'Show prev/next navigation buttons on hover (desktop only).', default: 'true'},
    {name: 'hasSnap', type: 'boolean', description: 'Enable scroll-snap so each child snaps to the start edge.', default: 'false'},
    {name: 'aria-label', type: 'string', description: 'Accessible label for the carousel region.', default: "\'Carousel\'"},
    {name: 'ref', type: 'React.Ref<HTMLDivElement>', description: 'Ref forwarded to the root element.'},
    {name: 'xstyle', type: 'StyleXStyles', description: 'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value.'},
    {name: 'className', type: 'string', description: 'CSS class name for the root element. Prefer xstyle for styling.'},
    {name: 'style', type: 'CSSProperties', description: 'Inline styles for the root element. Prefer xstyle.'},
    {name: 'data-testid', type: 'string', description: 'Test selector for automated testing frameworks.'},
  ],
  theming: {
    targets: [
      {className: 'xds-carousel'},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsZh = {
  usage: {
    description:
      'Carousel is a horizontal scroll container with fade-edge overflow indication and optional navigation buttons. Use to present a set of items that exceeds the available width, such as a gallery or filmstrip of cards.',
    bestPractices: [
      {guidance: true, description: 'Enable scroll-snap when each item should be viewed individually rather than as a continuous strip.'},
      {guidance: true, description: 'Provide a descriptive aria-label so assistive technology users understand the carousel\'s content.'},
      {guidance: false, description: 'Use a carousel for critical content that users must see — not all users scroll horizontally.'},
      {guidance: false, description: 'Auto-advance carousel items — let the user control scrolling at their own pace.'},
    ],
  },
  propDescriptions: {
    children: '在水平滚动容器中渲染的轮播项目。',
    gap: '使用间距令牌比例的项目间距。',
    hasButtons: '悬停时显示上一个/下一个导航按钮（仅桌面端）。',
    hasSnap: '启用滚动吸附，使每个子元素吸附到起始边缘。',
    'aria-label': '轮播区域的无障碍标签。',
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'horizontal scroll container w/ fade-edge overflow, optional prev/next nav buttons on top layer, scroll-snap',
  usage: {
    description:
      'Carousel is a horizontal scroll container with fade-edge overflow indication and optional navigation buttons. Use to present a set of items that exceeds the available width, such as a gallery or filmstrip of cards.',
    bestPractices: [
      {guidance: true, description: 'Enable scroll-snap when each item should be viewed individually rather than as a continuous strip.'},
      {guidance: true, description: 'Provide a descriptive aria-label so assistive technology users understand the carousel\'s content.'},
      {guidance: false, description: 'Use a carousel for critical content that users must see — not all users scroll horizontally.'},
      {guidance: false, description: 'Auto-advance carousel items — let the user control scrolling at their own pace.'},
    ],
  },
  propDescriptions: {
    children: 'carousel items in horizontal scroll',
    gap: 'item spacing via spacing token scale',
    hasButtons: 'prev/next buttons on hover (desktop)',
    hasSnap: 'scroll-snap; children snap to start edge',
    'aria-label': 'accessible label for carousel region',
  },
};
