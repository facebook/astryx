// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'SelectorOption',
  subComponentOf: 'Selector',
  displayName: 'Selector Option',
  isHiddenFromOverview: true,
  description: 'Helper component for custom item rendering inside an XDSSelector children render prop.',
  props: [
    {
      name: 'label',
      type: 'ReactNode',
      description: 'Primary label text for the item.',
      required: true,
    },
    {
      name: 'icon',
      type: 'XDSIconType',
      description: 'Icon displayed before the label. See `npx xds docs icons` for valid semantic names.',
    },
    {
      name: 'description',
      type: 'ReactNode',
      description: 'Secondary description text displayed below the label.',
    },
  ],
};

export const docsZh = {
  name: 'SelectorOption',
  isHiddenFromOverview: true,
  displayName: 'Selector Option',
  description: '用于在 XDSSelector 的 children 渲染函数中自定义选项渲染的辅助组件。',
  props: [
    {
      name: 'label',
      type: 'ReactNode',
      description: '选项的主标签文本。',
      required: true,
    },
    {
      name: 'icon',
      type: 'XDSIconType',
      description: '显示在标签前的图标。',
    },
    {
      name: 'description',
      type: 'ReactNode',
      description: '显示在标签下方的次要描述文本。',
    },
  ],
};

export const docsDense = {
  name: 'SelectorOption',
  isHiddenFromOverview: true,
  displayName: 'Selector Option',
  description: 'Helper component for custom item rendering inside XDSSelector children render prop.',
  propDescriptions: {
    label: 'Primary label text for item.',
    icon: 'Icon displayed before label.',
    description: 'Secondary description text below label.',
  },
};
