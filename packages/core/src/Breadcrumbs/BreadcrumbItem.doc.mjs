// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'BreadcrumbItem',
  subComponentOf: 'Breadcrumbs',
  displayName: 'Breadcrumb Item',
  isHiddenFromOverview: true,
  description: 'Individual breadcrumb item that renders as a link when href is provided, or as plain text for the current page.',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Label content for the breadcrumb item.',
      required: true,
    },
    {
      name: 'href',
      type: 'string',
      description: 'URL the breadcrumb links to; omit for non-navigable items.',
    },
    {
      name: 'onClick',
      type: '(e: MouseEvent) => void',
      description: 'Click handler for the breadcrumb item.',
    },
    {
      name: 'isCurrent',
      type: 'boolean',
      description: 'Marks this item as the current page, applying aria-current="page".',
      default: 'false',
    },
    {
      name: 'startIcon',
      type: 'ReactNode',
      description: 'Icon rendered before the item label.',
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
      name: 'as',
      type: 'XDSLinkComponentType',
      description: 'Custom link component to render instead of <a>. Overrides the provider-level default from XDSLinkProvider. Only applies to non-current items.',
    },
  ],
};

export const docsZh = {
  name: 'BreadcrumbItem',
  isHiddenFromOverview: true,
  displayName: 'Breadcrumb Item',
  description: '单个面包屑项，提供 href 时渲染为链接，当前页面渲染为纯文本。',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: '面包屑项的标签内容。',
      required: true,
    },
    {
      name: 'href',
      type: 'string',
      description: '面包屑链接的 URL；不可导航的项目请省略。',
    },
    {
      name: 'onClick',
      type: '(e: MouseEvent) => void',
      description: '面包屑项的点击处理函数。',
    },
    {
      name: 'isCurrent',
      type: 'boolean',
      description: '将此项标记为当前页面，应用 aria-current="page"。',
      default: 'false',
    },
    {
      name: 'startIcon',
      type: 'ReactNode',
      description: '在项目标签前渲染的图标。',
    },
    {
      name: 'as',
      type: 'XDSLinkComponentType',
      description: '自定义链接组件，代替 <a> 渲染。覆盖 XDSLinkProvider 设置的默认值。仅适用于非当前项。',
    },
  ],
};

export const docsDense = {
  name: 'BreadcrumbItem',
  isHiddenFromOverview: true,
  displayName: 'Breadcrumb Item',
  description: 'individual breadcrumb; link w/ href, plain text for current page',
  propDescriptions: {
    children: 'label content',
    href: 'link URL; omit for non-navigable items',
    onClick: 'click handler',
    isCurrent: 'marks current page w/ aria-current="page"',
    startIcon: 'icon before label',
    as: 'custom link component; overrides XDSLinkProvider default',
  },
};
