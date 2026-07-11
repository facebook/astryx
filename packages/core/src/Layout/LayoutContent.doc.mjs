// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

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
      name: 'isScrollable',
      type: 'boolean',
      description: 'Enable scrollable overflow.',
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
      name: 'isScrollable',
      type: 'boolean',
      description: '启用可滚动溢出。',
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
    padding: 'Internal padding on spacing scale. Overrides layout container default.',
    isScrollable: 'Enable scrollable overflow.',
    label: 'Accessible label for landmark element.',
    role: 'ARIA landmark role.',
  },
};
