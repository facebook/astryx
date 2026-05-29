// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Carousel',
  displayName: 'Carousel',
  category: 'Lists',
  keywords: ['carousel', 'slider', 'scroll', 'gallery', 'filmstrip', 'swiper', 'horizontal', 'overflow', 'snap'],
  usage: {
    description:
      'Carousel scrolls a row of items horizontally when they overflow the available width. Use it for card grids, image galleries, product lists, or any set of items that should be browsable without taking up the full page.',
    bestPractices: [
      {guidance: true, description: 'Enable scroll-snap when each item should land precisely at the start edge, like a gallery or product list.'},
      {guidance: true, description: 'Always provide an aria-label that describes what the carousel contains, like "Featured products" or "Team members".'},
      {guidance: true, description: 'Use a consistent gap and item width so the carousel looks intentional, not like content overflowing by accident.'},
      {guidance: false, description: 'Use a carousel for content every user must see — not everyone scrolls horizontally. Put critical content above the fold.'},
      {guidance: false, description: 'Auto-advance items — let the user scroll at their own pace.'},
      {guidance: false, description: 'Nest carousels — a carousel inside a carousel is confusing and breaks keyboard navigation.'},
    ],
    anatomy: [
      {name: 'Scroll container', required: true, description: 'The horizontal overflow area that holds all items.'},
      {name: 'Items', required: true, description: 'The children rendered in a row. Each item is animated with a scroll-driven scale effect.'},
      {name: 'Fade edges', required: true, description: 'Gradient fades on the left and right edges that indicate more content is available.'},
      {name: 'Navigation buttons', required: false, description: 'Prev/next buttons that appear on hover. Enabled by default, disable with hasButtons={false}.'},
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
  playground: {
    defaults: {
      children: [
        {__element: 'XDSCard', props: {padding: 4}, children: 'Slide 1'},
        {__element: 'XDSCard', props: {padding: 4}, children: 'Slide 2'},
        {__element: 'XDSCard', props: {padding: 4}, children: 'Slide 3'},
      ],
    },
  },
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
      'Carousel scrolls a row of items horizontally when they overflow the available width. Use it for card grids, image galleries, product lists, or any set of items that should be browsable without taking up the full page.',
    bestPractices: [
      {guidance: true, description: 'Enable scroll-snap when each item should land precisely at the start edge, like a gallery or product list.'},
      {guidance: true, description: 'Always provide an aria-label that describes what the carousel contains, like "Featured products" or "Team members".'},
      {guidance: true, description: 'Use a consistent gap and item width so the carousel looks intentional, not like content overflowing by accident.'},
      {guidance: false, description: 'Use a carousel for content every user must see — not everyone scrolls horizontally. Put critical content above the fold.'},
      {guidance: false, description: 'Auto-advance items — let the user scroll at their own pace.'},
      {guidance: false, description: 'Nest carousels — a carousel inside a carousel is confusing and breaks keyboard navigation.'},
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
  description: 'horizontal scroll container w/ fade edges, nav buttons, scroll-snap',
  usage: {
    description:
      'Carousel scrolls items horizontally when they overflow. Use for card grids, galleries, product lists.',
    bestPractices: [
      {guidance: true, description: 'Scroll-snap for precise alignment. Always set aria-label. Consistent gap and item width.'},
      {guidance: false, description: 'Critical content in carousels. Auto-advance. Nested carousels.'},
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
