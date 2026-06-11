// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'LayoutFooter',
  subComponentOf: 'Layout',
  displayName: 'Layout Footer',
  isHiddenFromOverview: true,
  description: 'Bottom bar for action bars, pagination, and status bars.',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Footer content.',
    },
    {
      name: 'hasDivider',
      type: 'boolean',
      description: 'Border at top edge.',
      default: 'false',
    },
    {
      name: 'height',
      type: 'number | string',
      description: 'Footer height.',
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
  name: 'LayoutFooter',
  isHiddenFromOverview: true,
  displayName: 'Layout Footer',
  description: '用于操作栏、分页和状态栏的底部栏。',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: '页脚内容。',
    },
    {
      name: 'hasDivider',
      type: 'boolean',
      description: '顶部边缘的边框。',
      default: 'false',
    },
    {
      name: 'height',
      type: 'number | string',
      description: '页脚高度。',
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
  name: 'LayoutFooter',
  isHiddenFromOverview: true,
  displayName: 'Layout Footer',
  description: 'Bottom bar for action bars, pagination, status bars.',
  propDescriptions: {
    children: 'Footer content.',
    hasDivider: 'Border at top edge.',
    height: 'Footer height.',
    label: 'Accessible label for landmark element.',
    role: 'ARIA landmark role.',
  },
};
