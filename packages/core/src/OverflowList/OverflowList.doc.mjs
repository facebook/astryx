// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'OverflowList',
  displayName: 'Overflow List',
  category: 'Lists',
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
  usage: {
    description:
      'A horizontal list that automatically hides items when they exceed the available width. Use OverflowList for breadcrumbs, toolbars, tag lists, or any row that needs to collapse gracefully at smaller sizes.',
    bestPractices: [
      { guidance: true, description: 'Provide a meaningful overflowRenderer — a "+N more" badge, a dropdown, or a count indicator.' },
      { guidance: true, description: 'Set minVisibleItems to keep key items visible regardless of container size.' },
      { guidance: false, description: 'Use OverflowList for vertical layouts — it only works with horizontal rows.' },
    ],
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'OverflowList',
  displayName: 'Overflow List',
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
  usage: {
    description:
      'A horizontal list that automatically hides items when they exceed the available width. Use OverflowList for breadcrumbs, toolbars, tag lists, or any row that needs to collapse gracefully at smaller sizes.',
    bestPractices: [
      { guidance: true, description: 'Provide a meaningful overflowRenderer — a "+N more" badge, a dropdown, or a count indicator.' },
      { guidance: true, description: 'Set minVisibleItems to keep key items visible regardless of container size.' },
      { guidance: false, description: 'Use OverflowList for vertical layouts — it only works with horizontal rows.' },
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'horizontal list w/ overflow indicator — hides items beyond container width',
  usage: {
    description:
      'A horizontal list that automatically hides items when they exceed the available width. Use OverflowList for breadcrumbs, toolbars, tag lists, or any row that needs to collapse gracefully at smaller sizes.',
    bestPractices: [
      { guidance: true, description: 'Provide a meaningful overflowRenderer — a "+N more" badge, a dropdown, or a count indicator.' },
      { guidance: true, description: 'Set minVisibleItems to keep key items visible regardless of container size.' },
      { guidance: false, description: 'Use OverflowList for vertical layouts — it only works with horizontal rows.' },
    ],
  },
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
