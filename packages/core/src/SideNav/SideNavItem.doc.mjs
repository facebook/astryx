// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'SideNavItem',
  subComponentOf: 'SideNav',
  displayName: 'Side Nav Item',
  isHiddenFromOverview: true,
  description: 'Navigation item with icon, selected state, optional end content, and nesting support via children.',
  props: [
    {
      name: 'label',
      type: 'string',
      description: 'Item label.',
      required: true,
    },
    {
      name: 'as',
      type: 'XDSLinkComponentType',
      description: 'Custom link component.',
    },
    {
      name: 'icon',
      type: 'XDSIconType',
      description: 'Icon displayed in the outline (unselected) variant. See `npx xds docs icons` for valid semantic names.',
    },
    {
      name: 'selectedIcon',
      type: 'XDSIconType',
      description: 'Icon displayed when the item is selected (filled variant). See `npx xds docs icons` for valid semantic names.',
    },
    {
      name: 'isSelected',
      type: 'boolean',
      description: 'Marks this item as the current page.',
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: 'Disabled state.',
      default: 'false',
    },
    {
      name: 'href',
      type: 'string',
      description: 'Navigation URL.',
    },
    {
      name: 'onClick',
      type: '(e: MouseEvent) => void',
      description: 'Click handler.',
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description: 'Right-side content such as badges or counts.',
      slotElements: [
        {
          __element: 'XDSIcon',
          props: {
            icon: 'chevronDown',
            size: 'sm',
          },
        },
        {
          __element: 'XDSBadge',
          props: {
            label: '3',
          },
        },
      ],
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Sub-items for nesting.',
      slotElements: [
        {
          __element: 'XDSSideNavItem',
          props: {
            label: 'Sub Item',
          },
        },
      ],
    },
    {
      name: 'collapsible',
      type: 'boolean | { defaultIsCollapsed?: boolean, isCollapsed?: boolean, onCollapsedChange?: (isCollapsed: boolean) => void }',
      description: 'Enables collapse behavior for items with children. Pass true for uncontrolled (starts expanded), or an object for controlled mode.',
      default: 'false',
    },
  ],
};

export const docsZh = {
  name: 'SideNavItem',
  isHiddenFromOverview: true,
  displayName: 'Side Nav Item',
  description: '导航项，支持图标、选中状态、可选尾部内容，以及通过 children 实现嵌套。',
  props: [
    {
      name: 'label',
      type: 'string',
      description: '项目标签。',
      required: true,
    },
    {
      name: 'as',
      type: 'XDSLinkComponentType',
      description: '自定义链接组件。',
    },
    {
      name: 'icon',
      type: 'XDSIconType',
      description: '轮廓（未选中）变体中显示的图标。',
    },
    {
      name: 'selectedIcon',
      type: 'XDSIconType',
      description: '选中时显示的图标（填充变体）。',
    },
    {
      name: 'isSelected',
      type: 'boolean',
      description: '将此项标记为当前页面。',
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '禁用状态。',
      default: 'false',
    },
    {
      name: 'href',
      type: 'string',
      description: '导航 URL。',
    },
    {
      name: 'onClick',
      type: '(e: MouseEvent) => void',
      description: '点击处理函数。',
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description: '右侧内容，如徽章或计数。',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: '用于嵌套的子项。',
    },
    {
      name: 'collapsible',
      type: 'boolean | { defaultIsCollapsed?: boolean, isCollapsed?: boolean, onCollapsedChange?: (isCollapsed: boolean) => void }',
      description: '启用带子项的折叠行为。传 true 为非受控模式（默认展开），或传对象用于受控模式。',
      default: 'false',
    },
  ],
};

export const docsDense = {
  name: 'SideNavItem',
  isHiddenFromOverview: true,
  displayName: 'Side Nav Item',
  description: 'Navigation item w/ icon, selected state, optional end content, nesting via children.',
  propDescriptions: {
    label: 'Item label.',
    as: 'Custom link component.',
    icon: 'Icon displayed in outline (unselected) variant.',
    selectedIcon: 'Icon displayed when item selected (filled variant).',
    isSelected: 'Marks this item as current page.',
    isDisabled: 'Disabled state.',
    href: 'Navigation URL.',
    onClick: 'Click handler.',
    endContent: 'Right-side content such as badges or counts.',
    children: 'Sub-items for nesting.',
    collapsible: 'Enables collapse for items w/ children. true=uncontrolled, object=controlled mode.',
  },
};
