// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'AvatarStatusDot',
  subComponentOf: 'Avatar',
  displayName: 'Avatar Status Dot',
  isHiddenFromOverview: true,
  description: 'Size-aware status indicator dot that reads avatar size from context and scales proportionally.',
  props: [
    {
      name: 'variant',
      type: "'success' | 'neutral' | 'error'",
      description: 'Semantic color variant of the dot.',
      default: "'success'",
    },
    {
      name: 'label',
      type: 'string',
      description: 'Accessible label for screen readers.',
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description: 'Icon centered inside the dot (hidden at tiny sizes).',
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
  ],
};

export const docsZh = {
  name: 'AvatarStatusDot',
  isHiddenFromOverview: true,
  displayName: 'Avatar Status Dot',
  description: '尺寸感知的状态指示点，从上下文中读取头像尺寸并等比缩放。',
  props: [
    {
      name: 'variant',
      type: "'success' | 'neutral' | 'error'",
      description: '状态点的语义颜色变体。',
      default: "'success'",
    },
    {
      name: 'label',
      type: 'string',
      description: '屏幕阅读器的无障碍标签。',
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description: '居中显示在状态点内的图标（tiny 尺寸时隐藏）。',
    },
  ],
};

export const docsDense = {
  name: 'AvatarStatusDot',
  isHiddenFromOverview: true,
  displayName: 'Avatar Status Dot',
  description: 'size-aware status dot, reads avatar size from context + scales proportionally',
  propDescriptions: {
    variant: 'semantic color variant',
    label: 'accessible label for screen readers',
    icon: 'icon centered in dot (hidden at tiny sizes)',
  },
};
