// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'LayoutContent',
  subComponentOf: 'Layout',
  displayName: 'Layout Content',
  isHiddenFromOverview: true,
  description: 'Scrollable main content area.',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Content.',
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
        "Block-axis sizing. 'fill' fills the Layout middle region; 'auto' uses natural height and moves with the fill-height Layout's middle scrollport.",
      default: "'fill'",
    },
    {
      name: 'isScrollable',
      type: 'boolean',
      description:
        'Enables scrollable overflow for this content area independently of its height.',
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
  ],
};

export const docsZh = {
  name: 'LayoutContent',
  isHiddenFromOverview: true,
  displayName: 'Layout Content',
  description: '可滚动的主内容区域。',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: '内容。',
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
        "区块轴尺寸。'fill' 填满 Layout 中间区域；'auto' 使用自然高度并随填充高度 Layout 的中间滚动区域移动。",
      default: "'fill'",
    },
    {
      name: 'isScrollable',
      type: 'boolean',
      description: '独立于高度控制此内容区域是否启用滚动溢出。',
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
  ],
};

export const docsDense = {
  name: 'LayoutContent',
  isHiddenFromOverview: true,
  displayName: 'Layout Content',
  description: 'Scrollable main content area.',
  propDescriptions: {
    children: 'Content.',
    padding:
      'Internal padding on spacing scale. Overrides layout container default.',
    height:
      'Fill the Layout middle region or use natural height and move with its middle scrollport.',
    isScrollable: 'Enable scrollable overflow independently of height.',
    label: 'Accessible label for landmark element.',
    role: 'ARIA landmark role.',
  },
};
