// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'LayoutHeader',
  subComponentOf: 'Layout',
  displayName: 'Layout Header',
  isHiddenFromOverview: true,
  description: 'Top bar for page titles, app bars, and toolbars.',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Header content.',
    },
    {
      name: 'hasDivider',
      type: 'boolean',
      description: 'Border at bottom edge.',
      default: 'false',
    },
    {
      name: 'height',
      type: 'number | string',
      description: 'Header height.',
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
  name: 'LayoutHeader',
  isHiddenFromOverview: true,
  displayName: 'Layout Header',
  description: '用于页面标题、应用栏和工具栏的顶部栏。',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: '页眉内容。',
    },
    {
      name: 'hasDivider',
      type: 'boolean',
      description: '底部边缘的边框。',
      default: 'false',
    },
    {
      name: 'height',
      type: 'number | string',
      description: '页眉高度。',
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
  name: 'LayoutHeader',
  isHiddenFromOverview: true,
  displayName: 'Layout Header',
  description: 'Top bar for page titles, app bars, toolbars.',
  propDescriptions: {
    children: 'Header content.',
    hasDivider: 'Border at bottom edge.',
    height: 'Header height.',
    label: 'Accessible label for landmark element.',
    role: 'ARIA landmark role.',
  },
};
