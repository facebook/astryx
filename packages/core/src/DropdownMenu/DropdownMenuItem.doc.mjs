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
      name: 'isSelected',
      type: 'boolean',
      description: 'Selection state for single-select menus. When defined (true or false), the item renders as role="menuitemradio" with aria-checked and shows a check indicator when selected; unselected siblings reserve the same space for a stable layout. Leave undefined for plain action items.',
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
      name: 'isSelected',
      type: 'boolean',
      description: '单选菜单的选中状态。定义后（true 或 false）项目渲染为 role="menuitemradio" 并带有 aria-checked，选中时显示对勾指示器；未选中的同级项保留相同空间以保持布局稳定。普通操作项请保持未定义。',
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
    isSelected: 'single-select state; defined → role="menuitemradio" + aria-checked, check icon when true, space reserved when false; undefined → plain menuitem',
    xstyle: 'StyleX styles for root container',
  },
};
