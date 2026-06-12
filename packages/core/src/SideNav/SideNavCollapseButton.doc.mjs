// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'SideNavCollapseButton',
  subComponentOf: 'SideNav',
  displayName: 'Side Nav Collapse Button',
  isHiddenFromOverview: true,
  description: 'Toggle button for sidenav collapse. Place inside XDSSideNav (reads context automatically) or outside (pass handleRef). Renders as an icon-only ghost button by default.',
  props: [
    {
      name: 'handleRef',
      type: 'RefObject<XDSSideNavImperativeCollapseHandle | null>',
      description: 'Imperative collapse handle from XDSSideNav. Only needed when the button is rendered outside the sidenav.',
    },
    {
      name: 'label',
      type: 'string',
      description: 'Custom button label. When provided, renders as a text button with chevron. When omitted, renders icon-only.',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Custom button content. Overrides the default chevron icon and label.',
    },
  ],
};

export const docsZh = {
  name: 'SideNavCollapseButton',
  isHiddenFromOverview: true,
  displayName: 'Side Nav Collapse Button',
  description: '侧边栏折叠切换按钮。放置在 XDSSideNav 内部（自动读取上下文）或外部（传入 handleRef）。默认渲染为仅图标的 ghost 按钮。',
  props: [
    {
      name: 'handleRef',
      type: 'RefObject<XDSSideNavImperativeCollapseHandle | null>',
      description: '来自 XDSSideNav 的命令式折叠句柄。仅在按钮渲染在侧边栏外部时需要。',
    },
    {
      name: 'label',
      type: 'string',
      description: '自定义按钮标签。提供时渲染为带箭头的文本按钮。省略时渲染为仅图标按钮。',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: '自定义按钮内容。覆盖默认的箭头图标和标签。',
    },
  ],
};

export const docsDense = {
  name: 'SideNavCollapseButton',
  isHiddenFromOverview: true,
  displayName: 'Side Nav Collapse Button',
  description: 'Toggle button for sidenav collapse. Place inside XDSSideNav (reads context) or outside (pass handleRef). Icon-only ghost button by default.',
  propDescriptions: {
    handleRef: 'Imperative collapse handle from XDSSideNav. Only needed when button rendered outside sidenav.',
    label: 'Custom label. Text button w/ chevron when provided, icon-only when omitted.',
    children: 'Custom content. Overrides default chevron icon + label.',
  },
};
