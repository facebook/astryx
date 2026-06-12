// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'DialogHeader',
  subComponentOf: 'Dialog',
  displayName: 'Dialog Header',
  isHiddenFromOverview: true,
  description: 'Header for dialogs with a title, optional subtitle, close button, and start/end content slots.',
  props: [
    {
      name: 'title',
      type: 'string',
      description: 'Dialog title (receives focus on open).',
    },
    {
      name: 'subtitle',
      type: 'string',
      description: 'Subtitle below the title.',
    },
    {
      name: 'onOpenChange',
      type: '(isOpen: boolean) => unknown',
      description: 'Close button callback (no button if omitted).',
    },
    {
      name: 'startContent',
      type: 'ReactNode',
      description: 'Content before the title (e.g., a back button).',
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
      name: 'endContent',
      type: 'ReactNode',
      description: 'Content after the title, before close button.',
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
      name: 'hasDivider',
      type: 'boolean',
      description: 'Adds border at the bottom edge.',
      default: 'true',
    },
  ],
};

export const docsZh = {
  name: 'DialogHeader',
  isHiddenFromOverview: true,
  displayName: 'Dialog Header',
  description: '对话框头部，包含标题、可选副标题、关闭按钮以及首尾内容插槽。',
  props: [
    {
      name: 'title',
      type: 'string',
      description: '对话框标题（打开时获得焦点）。',
    },
    {
      name: 'subtitle',
      type: 'string',
      description: '标题下方的副标题。',
    },
    {
      name: 'onOpenChange',
      type: '(isOpen: boolean) => unknown',
      description: '关闭按钮的回调（省略时不显示按钮）。',
    },
    {
      name: 'startContent',
      type: 'ReactNode',
      description: '标题之前的内容（例如返回按钮）。',
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description: '标题之后、关闭按钮之前的内容。',
    },
    {
      name: 'hasDivider',
      type: 'boolean',
      description: '在底部边缘添加分隔线。',
      default: 'true',
    },
  ],
};

export const docsDense = {
  name: 'DialogHeader',
  isHiddenFromOverview: true,
  displayName: 'Dialog Header',
  description: 'dialog header w/ title, optional subtitle, close button, start/end content slots',
  propDescriptions: {
    title: 'dialog title (receives focus on open)',
    subtitle: 'subtitle below title',
    onOpenChange: 'close button callback (omit=no button)',
    startContent: 'content before title (e.g. back button)',
    endContent: 'content after title, before close button',
    hasDivider: 'bottom border',
  },
};
