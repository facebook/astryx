// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'LayoutPanel',
  subComponentOf: 'Layout',
  displayName: 'Layout Panel',
  isHiddenFromOverview: true,
  description: 'Sidebar for navigation, settings, or inspector panels.',
  playground: {
    defaults: {
      children: 'Panel Content',
      hasDivider: true,
      width: 200,
    },
    wrapper: {
      component: 'Layout',
      slotProp: 'start',
      props: {
        content: {
          __element: 'LayoutContent',
          props: {},
          children: 'Main content area',
        },
      },
    },
  },
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Panel content.',
    },
    {
      name: 'hasDivider',
      type: 'boolean',
      description:
        'Border on the appropriate edge. Auto-height panels stretch across the shared row so the divider spans the full middle region.',
      default: 'false',
    },
    {
      name: 'padding',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description:
        'Internal padding using the spacing scale. Overrides the default padding from the layout container.',
    },
    {
      name: 'height',
      type: "'fill' | 'auto'",
      description:
        "Block-axis sizing. 'fill' fills the Layout middle viewport. With 'auto', panel content contributes its natural height to the shared row and the panel box stretches across that row so its background and divider remain continuous.",
      default: "'fill'",
    },
    {
      name: 'isScrollable',
      type: 'boolean',
      description:
        'Enables scrollable overflow for this panel independently of its height.',
      default: 'true',
    },
    {
      name: 'label',
      type: 'string',
      description: 'Accessible label for the landmark element.',
    },
    {
      name: 'role',
      type: 'AriaRole',
      description: 'ARIA landmark role.',
    },
    {
      name: 'width',
      type: 'number | string',
      description:
        'Width of the panel. Numbers are treated as pixels, strings are used as-is. Ignored when resizable is provided; the hook controls width.',
    },
    {
      name: 'resizable',
      type: 'ResizableProps',
      description:
        "Resize props from useResizable(). When provided, the hook drives the panel width and a ResizeHandle should be placed adjacent to the panel. Carries the region's axis ('horizontal' | 'vertical'), which must match the adjacent ResizeHandle's direction.",
    },
  ],
};

export const docsZh = {
  name: 'LayoutPanel',
  isHiddenFromOverview: true,
  displayName: 'Layout Panel',
  description: '用于导航、设置或检查器面板的侧边栏。',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: '面板内容。',
    },
    {
      name: 'hasDivider',
      type: 'boolean',
      description:
        '相应边缘的边框。自动高度面板会沿共享行拉伸，使分隔线覆盖整个中间区域。',
      default: 'false',
    },
    {
      name: 'padding',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description: '使用间距比例的内边距。覆盖布局容器的默认内边距。',
    },
    {
      name: 'height',
      type: "'fill' | 'auto'",
      description:
        "区块轴尺寸。'fill' 填满 Layout 中间视口；使用 'auto' 时，面板内容以自然高度参与共享行，而面板盒会拉伸到整行，使背景和分隔线保持连续。",
      default: "'fill'",
    },
    {
      name: 'isScrollable',
      type: 'boolean',
      description: '独立于高度控制此面板是否启用滚动溢出。',
      default: 'true',
    },
    {
      name: 'label',
      type: 'string',
      description: '地标元素的无障碍标签。',
    },
    {
      name: 'role',
      type: 'AriaRole',
      description: 'ARIA 地标角色。',
    },
    {
      name: 'width',
      type: 'number | string',
      description:
        '面板宽度。数字按像素处理，字符串按原样使用。提供 resizable 时忽略，宽度由 hook 控制。',
    },
    {
      name: 'resizable',
      type: 'ResizableProps',
      description:
        "来自 useResizable() 的调整大小属性。提供时面板宽度由 hook 驱动，应在面板旁放置 ResizeHandle。其中携带区域的轴向（'horizontal' | 'vertical'），必须与相邻 ResizeHandle 的 direction 一致。",
    },
  ],
};

export const docsDense = {
  name: 'LayoutPanel',
  isHiddenFromOverview: true,
  displayName: 'Layout Panel',
  description: 'Sidebar for navigation, settings, inspector panels.',
  propDescriptions: {
    children: 'Panel content.',
    hasDivider:
      'Border on the appropriate edge; auto-height panels stretch it across the full middle region.',
    padding:
      'Internal padding on spacing scale. Overrides layout container default.',
    height:
      'Fill the middle viewport, or let content contribute natural row height while the panel box stretches for continuous background/dividers.',
    isScrollable: 'Enable scrollable overflow independently of height.',
    label: 'Accessible label for landmark element.',
    role: 'ARIA landmark role.',
    width:
      'Panel width. Numbers = pixels, strings as-is. Ignored when resizable provided; hook controls width.',
    resizable:
      'Resize props from useResizable(). Hook drives panel width; place ResizeHandle adjacent.',
  },
};
