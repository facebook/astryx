/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Carousel',
  description:
    'Horizontal scroll container with fade-edge overflow indication, optional navigation buttons, and scroll-snap support.',
  showcase: {
    aspectRatio: 16 / 9,
    code: '<XDSCarousel><div>Slide 1</div></XDSCarousel>',
  },
  keywords: ['carousel', 'slider', 'scroll', 'gallery', 'filmstrip', 'swiper', 'horizontal', 'overflow', 'snap'],
  features: [
    'Overflow Detection: Gradient fades appear at edges when content overflows, signaling more items',
    'Navigation Buttons: Prev/next buttons appear on hover (desktop only) via XDSLayer top-layer rendering',
    'Scroll Snap: Optional snap-to-item behavior for precise item alignment',
    'Gap Scale: Configurable item spacing using the spacing token scale (0 to 4)',
    'Scale Animation: Items scale down slightly when entering/exiting the viewport via scroll-driven animation',
    'Accessible: role="region" with aria-roledescription="carousel" and configurable aria-label',
    'Reduced Motion: Respects prefers-reduced-motion for scroll behavior and entry animations',
  ],
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
  accessibility: [
    'Root element uses role="region" with aria-roledescription="carousel" for screen reader context.',
    'Navigation buttons have accessible labels ("Scroll left", "Scroll right").',
    'Scroll behavior and scale animations respect prefers-reduced-motion.',
  ],
  notes: [
    'Navigation buttons render on the top layer via XDSLayer, so they escape parent overflow clipping.',
    'The fade-edge effect uses CSS mask-image gradients that transition smoothly.',
    'Each child is wrapped in a flex-shrink:0 container with scroll-snap-align:start when snap is enabled.',
    'Items use scroll-driven animation (animationTimeline: view(inline)) for the scale effect.',
  ],
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsZh = {
  description: '水平滚动容器，具有渐变边缘溢出指示、可选导航按钮和滚动吸附支持。',
  features: [
    '溢出检测：当内容溢出时，边缘出现渐变淡化效果，提示还有更多项目',
    '导航按钮：鼠标悬停时显示上一个/下一个按钮（仅桌面端），通过 XDSLayer 顶层渲染',
    '滚动吸附：可选的吸附到项目行为，实现精确的项目对齐',
    '间距比例：使用间距令牌比例（0 到 4）配置项目间距',
    '缩放动画：项目在进入/离开视口时通过滚动驱动动画略微缩小',
    '无障碍：role="region"，带 aria-roledescription="carousel" 和可配置的 aria-label',
    '减少动效：尊重 prefers-reduced-motion 的滚动行为和入场动画',
  ],
  propDescriptions: {
    children: '在水平滚动容器中渲染的轮播项目。',
    gap: '使用间距令牌比例的项目间距。',
    hasButtons: '悬停时显示上一个/下一个导航按钮（仅桌面端）。',
    hasSnap: '启用滚动吸附，使每个子元素吸附到起始边缘。',
    'aria-label': '轮播区域的无障碍标签。',
  },
  accessibility: [
    '根元素使用 role="region" 和 aria-roledescription="carousel"，为屏幕阅读器提供上下文。',
    '导航按钮具有无障碍标签（"向左滚动"、"向右滚动"）。',
    '滚动行为和缩放动画尊重 prefers-reduced-motion。',
  ],
  notes: [
    '导航按钮通过 XDSLayer 在顶层渲染，因此它们可以逃离父级溢出裁剪。',
    '渐变边缘效果使用 CSS mask-image 渐变，过渡平滑。',
    '启用吸附时，每个子元素被包裹在 flex-shrink:0 容器中，带有 scroll-snap-align:start。',
    '项目使用滚动驱动动画（animationTimeline: view(inline)）实现缩放效果。',
  ],
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'horizontal scroll container w/ fade-edge overflow, optional prev/next nav buttons on top layer, scroll-snap',
  features: [
    'overflow detection: gradient fades at edges when content overflows',
    'nav buttons: prev/next on hover (desktop) via XDSLayer top-layer',
    'scroll-snap: optional snap-to-item alignment',
    'gap scale: spacing token scale 0-4',
    'scale animation: items shrink at viewport edges via scroll-driven anim',
    'a11y: role=region + aria-roledescription=carousel',
    'prefers-reduced-motion: smooth scroll + scale anim disabled',
  ],
  propDescriptions: {
    children: 'carousel items in horizontal scroll',
    gap: 'item spacing via spacing token scale',
    hasButtons: 'prev/next buttons on hover (desktop)',
    hasSnap: 'scroll-snap; children snap to start edge',
    'aria-label': 'accessible label for carousel region',
  },
  accessibility: [
    'root: role=region + aria-roledescription=carousel',
    'nav buttons: "Scroll left"/"Scroll right" labels',
    'respects prefers-reduced-motion',
  ],
  notes: [
    'nav buttons on top layer via XDSLayer; escape parent overflow',
    'fade-edge: CSS mask-image gradients w/ smooth transition',
    'children wrapped in flex-shrink:0 + scroll-snap-align:start when snap on',
    'scroll-driven animation (animationTimeline: view(inline)) for scale effect',
  ],
};
