// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Carousel',
  displayName: 'Carousel',
  category: 'Container',
  keywords: ['carousel', 'slider', 'scroll', 'gallery', 'filmstrip', 'swiper', 'horizontal', 'overflow', 'snap'],
  usage: {
    description:
      'Carousel scrolls a row of items horizontally when they overflow the available width. Use it for card grids, image galleries, product lists, or any set of items that should be browsable without taking up the full page.',
    bestPractices: [
      {guidance: true, description: 'Enable scroll-snap when each item should land precisely at the start edge, like a gallery or product list.'},
      {guidance: true, description: 'Always provide an aria-label that describes what the carousel contains, like "Featured products" or "Team members".'},
      {guidance: true, description: 'Use a consistent gap and item width so the carousel looks intentional, not like content overflowing by accident.'},
      {guidance: true, description: 'Trust the built-in navigation: trackpad users can swipe horizontally, and mouse users can hold Shift while scrolling the wheel to move through items.'},
      {guidance: false, description: 'Use a carousel for content every user must see. Not everyone scrolls horizontally, so put critical content above the fold.'},
      {guidance: false, description: 'Auto-advance items. Let the user scroll at their own pace.'},
      {guidance: false, description: 'Nest carousels. A carousel inside a carousel is confusing and breaks keyboard navigation.'},
    ],
    anatomy: [
      {name: 'Scroll container', required: true, description: 'The horizontal overflow area that holds all items.'},
      {name: 'Items', required: true, description: 'The children rendered in a row inside the scroll container. With hasSnap, each item snaps to the start edge.'},
      {name: 'Fade edges', required: false, description: 'Gradient fades on the left and right edges that indicate more content is available. Enabled by default, disable with hasEdgeFade={false}.'},
      {name: 'Navigation buttons', required: false, description: 'Prev/next buttons that appear when the content can scroll in that direction. Enabled by default, disable with hasButtons={false}.'},
    ],
  },
  props: [
    {name: 'children', type: 'ReactNode', description: 'Carousel items rendered in a horizontal scroll container.', required: true},
    {name: 'gap', type: "0 | 0.5 | 1 | 1.5 | 2 | 3 | 4", description: 'Gap between items using the spacing token scale.', default: '1'},
    {name: 'hasButtons', type: 'boolean', description: 'Show prev/next navigation buttons when content is scrollable.', default: 'true'},
    {name: 'hasEdgeFade', type: 'boolean', description: 'Show a gradient edge-fade mask when content overflows, signalling that more items exist off-screen.', default: 'true'},
    {name: 'hasSnap', type: 'boolean', description: 'Enable scroll-snap so each child snaps to the start edge.', default: 'false'},
    {name: 'padding', type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10', description: 'Inline padding inside the scroll container, with matching scroll-padding so snap points align to the content edge.'},
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
        {__element: 'Card', props: {padding: 4}, children: 'Slide 1'},
        {__element: 'Card', props: {padding: 4}, children: 'Slide 2'},
        {__element: 'Card', props: {padding: 4}, children: 'Slide 3'},
      ],
    },
  },
  theming: {
    targets: [
      {className: 'astryx-carousel'},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsZh = {
  usage: {
    description:
      'Carousel 在项目超出可用宽度时将一行项目水平滚动。适用于卡片网格、图片画廊、产品列表，或任何希望无需占据整页即可浏览的项目集合。',
    bestPractices: [
      {guidance: true, description: '当每个项目应精确对齐到起始边缘时启用滚动吸附，例如画廊或产品列表。'},
      {guidance: true, description: '始终提供描述轮播内容的 aria-label，例如"精选产品"或"团队成员"。'},
      {guidance: true, description: '使用一致的间距和项目宽度，让轮播看起来是有意为之，而不是内容意外溢出。'},
      {guidance: false, description: '将每位用户都必须看到的内容放入轮播。并非所有人都会水平滚动，关键内容应放在首屏。'},
      {guidance: false, description: '自动轮播项目。让用户按自己的节奏滚动。'},
      {guidance: false, description: '嵌套轮播。轮播中嵌套轮播会造成困惑并破坏键盘导航。'},
    ],
  },
  propDescriptions: {
    children: '在水平滚动容器中渲染的轮播项目。',
    gap: '使用间距令牌比例的项目间距。',
    hasButtons: '内容可滚动时显示上一个/下一个导航按钮。',
    hasEdgeFade: '内容溢出时显示渐变边缘遮罩，提示屏幕外还有更多项目。',
    hasSnap: '启用滚动吸附，使每个子元素吸附到起始边缘。',
    padding: '滚动容器内的内联内边距，并设置匹配的 scroll-padding，使吸附点与内容边缘对齐。',
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
      {guidance: true, description: 'Enable scroll-snap when each item should land precisely at the start edge: gallery, product list.'},
      {guidance: true, description: 'Always provide an aria-label describing what the carousel contains: "Featured products", "Team members".'},
      {guidance: true, description: 'Use consistent gap + item width so the carousel looks intentional, not like content overflowing by accident.'},
      {guidance: false, description: 'Use a carousel for content every user must see. Not everyone scrolls horizontally, so put critical content above the fold.'},
      {guidance: false, description: 'Auto-advance items. Let the user scroll at their own pace.'},
      {guidance: false, description: 'Nest carousels. A carousel inside a carousel is confusing and breaks keyboard navigation.'},
    ],
  },
  propDescriptions: {
    children: 'carousel items in horizontal scroll',
    gap: 'item spacing via spacing token scale',
    hasButtons: 'prev/next buttons when content is scrollable',
    hasEdgeFade: 'gradient edge-fade mask on overflow',
    hasSnap: 'scroll-snap; children snap to start edge',
    padding: 'inline padding; scroll-padding keeps snap points on content edge',
    'aria-label': 'accessible label for carousel region',
    'data-testid': 'test selector for automated testing frameworks',
  },
};
