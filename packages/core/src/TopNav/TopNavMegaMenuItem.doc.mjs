// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'TopNavMegaMenuItem',
  subComponentOf: 'TopNav',
  displayName: 'Top Nav Mega Menu Item',
  isHiddenFromOverview: true,
  description: 'An individual item inside an XDSTopNavMegaMenu. Renders itself in both desktop (popover grid) and mobile drawer modes via render mode context.',
  props: [
    {
      name: 'title',
      type: 'string',
      description: 'Display title for the menu item.',
      required: true,
    },
    {
      name: 'description',
      type: 'string',
      description: 'Optional description text displayed below the title.',
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description: 'Optional icon element displayed to the left.',
      slotElements: [
        {
          __element: 'XDSIcon',
          props: {
            icon: 'check',
            size: 'sm',
          },
        },
      ],
    },
    {
      name: 'href',
      type: 'string',
      description: 'URL to navigate to when clicked.',
    },
    {
      name: 'onClick',
      type: '() => void',
      description: 'Callback when item is clicked.',
    },
    {
      name: 'as',
      type: 'XDSLinkComponentType',
      description: 'Custom component to render instead of <a> for link items. Overrides the provider-level default set by XDSLinkProvider.',
    },
  ],
};

export const docsZh = {
  name: 'TopNavMegaMenuItem',
  isHiddenFromOverview: true,
  displayName: 'Top Nav Mega Menu Item',
  description: '超级菜单中的单个项目。在桌面端（弹出层网格）和移动抽屉模式中都会自行渲染。',
  props: [
    {
      name: 'title',
      type: 'string',
      description: '菜单项的显示标题。',
      required: true,
    },
    {
      name: 'description',
      type: 'string',
      description: '标题下方的可选描述文本。',
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description: '左侧显示的可选图标元素。',
    },
    {
      name: 'href',
      type: 'string',
      description: '点击时导航的 URL。',
    },
    {
      name: 'onClick',
      type: '() => void',
      description: '点击项目时的回调。',
    },
    {
      name: 'as',
      type: 'XDSLinkComponentType',
      description: '用于替代 <a> 的自定义链接组件。覆盖 XDSLinkProvider 设置的默认组件。',
    },
  ],
};

export const docsDense = {
  name: 'TopNavMegaMenuItem',
  isHiddenFromOverview: true,
  displayName: 'Top Nav Mega Menu Item',
  description: 'Individual mega menu item. Renders in desktop popover grid + mobile drawer modes via context.',
  propDescriptions: {
    title: 'Display title.',
    description: 'Description below title.',
    icon: 'Left icon element.',
    href: 'Navigation URL.',
    onClick: 'Click callback.',
    as: 'Custom link component, overrides XDSLinkProvider default.',
  },
};
