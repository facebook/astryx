// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'DropdownMenuItem',
  subComponentOf: 'DropdownMenu',
  displayName: 'Dropdown Menu Item',
  isHiddenFromOverview: true,
  description: 'Helper component for custom item rendering with consistent styling.',
  props: [
    {
      name: 'icon',
      type: 'IconType',
      description: 'Icon to display before the label. See `npx astryx docs icons` for valid semantic names.',
    },
    {
      name: 'label',
      type: 'ReactNode',
      description: 'Primary label text.',
    },
    {
      name: 'description',
      type: 'ReactNode',
      description: 'Secondary description text displayed below the label.',
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description: 'Additional content rendered after the label and description.',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: 'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value: not an inline style object like style={{}}.',
    },
  ],
};

export const docsZh = {
  name: 'DropdownMenuItem',
  isHiddenFromOverview: true,
  displayName: 'Dropdown Menu Item',
  description: '用于自定义项渲染的辅助组件，提供一致的样式。',
  props: [
    {
      name: 'icon',
      type: 'IconType',
      description: '显示在标签前的图标。',
    },
    {
      name: 'label',
      type: 'ReactNode',
      description: '主标签文本。',
    },
    {
      name: 'description',
      type: 'ReactNode',
      description: '显示在标签下方的次要描述文本。',
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description: '在标签和描述之后渲染的附加内容。',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: '根容器的 StyleX 样式。',
    },
  ],
};

export const docsDense = {
  name: 'DropdownMenuItem',
  isHiddenFromOverview: true,
  displayName: 'Dropdown Menu Item',
  description: 'helper for custom item rendering w/ consistent styling',
  propDescriptions: {
    icon: 'icon before label',
    label: 'primary label text',
    description: 'secondary text below label',
    endContent: 'additional content after label+description',
    xstyle: 'StyleX styles for root container',
  },
};
