/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'OverflowList',
  description:
    'Horizontal list that hides items that overflow the available width and shows a custom indicator. Uses a hidden measurement container to avoid layout flicker.',
  showcase: {
    aspectRatio: 16 / 4,
    code: '<XDSOverflowList items={[]} renderItem={() => null} renderOverflow={() => null} />',
  },
  keywords: [
    'overflow',
    'truncate',
    'collapse',
    'breadcrumb',
    'toolbar',
    'tag-list',
    'pill-list',
    'more',
    'clamp',
    'responsive',
  ],
  features: [
    "Hides items that don't fit in the container width",
    'Custom overflow indicator via overflowRenderer — receives the list of hidden items',
    'Indicator space reserved via hidden measurement — no manual width needed',
    'Collapse from start or end',
    'Minimum visible items guarantee',
    'observeParent behavior for content-sized containers alongside siblings',
  ],
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Items to render. Each child should be a single element.',
      required: true,
    },
    {
      name: 'overflowRenderer',
      type: '(overflowItems: XDSOverflowItem[]) => ReactNode',
      description:
        'Render function for the overflow indicator. Receives the list of hidden items (each with child and index). Only called when items are overflowing.',
    },
    {
      name: 'gap',
      type: 'SpacingStep',
      description:
        'Gap between items as a spacing token step (0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10).',
      default: '2',
    },
    {
      name: 'minVisibleItems',
      type: 'number',
      description: 'Minimum number of items to always show, even when overflowing.',
      default: '0',
    },
    {
      name: 'collapseFrom',
      type: "'start' | 'end'",
      description: 'Which end to collapse items from when overflow occurs.',
      default: "'end'",
    },
    {
      name: 'behavior',
      type: "'observeSelf' | 'observeParent'",
      description:
        "Controls which element is measured for available width. 'observeSelf' uses the container's own width. 'observeParent' observes the parent element — useful when the list should stay content-sized while still detecting available space.",
      default: "'observeSelf'",
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value — not an inline style object.',
    },
  ],
  theming: {
    targets: [
      {className: 'xds-overflow-list'},
    ],
  },
  accessibility: [
    'The hidden measurement container is aria-hidden and inert — it does not appear in the accessibility tree.',
    'The visible container renders a plain div with no implicit role. Add aria-label if the list has semantic meaning.',
    'When using overflowRenderer with a dropdown, ensure the trigger has a meaningful label (e.g., "+3 more actions").',
  ],
  notes: [
    'Overflow detection uses ResizeObserver on the container or its parent, depending on the behavior prop.',
    'The overflowRenderer is rendered in a hidden measurement container at full item count to reserve the correct space before any items are hidden.',
    'Items are measured in the hidden container without visible paint — switching from hidden to visible is instant with no layout shift.',
    "For collapseFrom='start', items are hidden from the beginning and the overflow indicator appears at the start.",
    'Use minVisibleItems to guarantee at least N items are always visible regardless of available space.',
  ],
  usage: {
    summary: 'Horizontal list that hides items exceeding the available width and shows an overflow indicator.',
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'OverflowList',
  description:
    '横向列表，当宽度不足时隐藏超出的项目并显示自定义指示器。使用隐藏的测量容器避免布局抖动。',
  features: [
    '隐藏超出容器宽度的项目',
    '通过 overflowRenderer 自定义溢出指示器 — 接收隐藏项目列表',
    '通过隐藏测量预留指示器空间 — 无需手动指定宽度',
    '从起始或末尾折叠',
    '保证最小可见项目数',
    '支持 observeParent 模式，用于与兄弟元素并排的内容尺寸容器',
  ],
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: '要渲染的项目，每个子元素应为单一元素。',
      required: true,
    },
    {
      name: 'overflowRenderer',
      type: '(overflowItems: XDSOverflowItem[]) => ReactNode',
      description:
        '溢出指示器的渲染函数。接收隐藏项目列表（每项包含 child 和 index）。仅在有溢出项时调用。',
    },
    {
      name: 'gap',
      type: 'SpacingStep',
      description:
        '项目间距，使用间距步进值（0、0.5、1、1.5、2、3、4、5、6、8、10）。',
      default: '2',
    },
    {
      name: 'minVisibleItems',
      type: 'number',
      description: '溢出时始终显示的最小项目数。',
      default: '0',
    },
    {
      name: 'collapseFrom',
      type: "'start' | 'end'",
      description: '溢出时从哪一端开始折叠项目。',
      default: "'end'",
    },
    {
      name: 'behavior',
      type: "'observeSelf' | 'observeParent'",
      description:
        "控制测量可用宽度的元素。'observeSelf' 使用容器自身宽度；'observeParent' 观察父元素，适用于需要内容尺寸但仍检测可用空间的场景。",
      default: "'observeSelf'",
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局自定义的 StyleX 样式（外边距、定位、尺寸）。必须使用 stylex.create() 的值，而非内联样式对象。',
    },
  ],
  accessibility: [
    '隐藏的测量容器设置了 aria-hidden 和 inert — 不出现在无障碍树中。',
    '可见容器渲染为普通 div，无隐式角色。如果列表有语义含义，请添加 aria-label。',
    '使用下拉菜单作为 overflowRenderer 时，确保触发按钮有有意义的标签（如"+3 个更多操作"）。',
  ],
  notes: [
    '溢出检测使用 ResizeObserver 监听容器或其父元素，具体取决于 behavior 属性。',
    'overflowRenderer 在隐藏测量容器中以完整项目数渲染，以在隐藏任何项目前预留正确的空间。',
    '项目在隐藏容器中测量，无可见渲染 — 从隐藏切换到可见是即时的，无布局偏移。',
    "使用 collapseFrom='start' 时，项目从起始处隐藏，溢出指示器出现在起始位置。",
    '使用 minVisibleItems 保证无论可用空间多少，始终显示至少 N 个项目。',
  ],
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'horizontal list w/ overflow indicator — hides items beyond container width',
  features: [
    'hide items beyond container width',
    'custom overflow indicator via overflowRenderer — receives hidden items',
    'indicator space auto-reserved via hidden measurement',
    'collapse from start or end',
    'min visible items guarantee',
    'observeParent mode for content-sized containers',
  ],
  notes: [
    'overflow detection: ResizeObserver on container or parent (depends on behavior)',
    'overflowRenderer measured at full item count to pre-reserve indicator space',
    'instant switch hidden to visible, no layout shift',
    "collapseFrom='start': items hidden from beginning, indicator at start",
    'minVisibleItems: N items always visible regardless of space',
  ],
  accessibility: [
    'hidden measurement container: aria-hidden + inert, not in a11y tree',
    'visible container: plain div, no role, add aria-label if list has semantic meaning',
    'overflow dropdown: ensure trigger has meaningful aria-label',
  ],
  propDescriptions: {
    children: 'items to render, each child should be a single element',
    overflowRenderer: 'renders overflow indicator, receives hidden items w/ index',
    gap: 'item gap as spacing step',
    minVisibleItems: 'min items always shown even when overflowing',
    collapseFrom: 'which end to collapse from',
    behavior: 'observeSelf (default) or observeParent for content-sized containers',
    xstyle: 'StyleX styles, use stylex.create() values only',
  },
};
