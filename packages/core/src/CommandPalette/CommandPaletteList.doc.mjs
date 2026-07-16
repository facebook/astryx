// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'CommandPaletteList',
  subComponentOf: 'CommandPalette',
  displayName: 'Command Palette List',
  isHiddenFromOverview: true,
  description: 'Scrollable results container. Renders as a listbox for ARIA. Contains CommandPaletteItem and CommandPaletteGroup children.',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Items, groups, and empty states.',
      required: true,
    },
    {
      name: 'label',
      type: 'string',
      description: 'Accessible label for the listbox.',
      default: "'Commands'",
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: 'StyleX styles for layout customization. Must be a stylex.create() value.',
    },
  ],
  playground: {
    defaults: {
      children: [
        {__element: 'CommandPaletteItem', props: {value: 'home', onSelect: undefined}, children: 'Go Home'},
        {__element: 'CommandPaletteItem', props: {value: 'settings', onSelect: undefined}, children: 'Open Settings'},
        {__element: 'CommandPaletteItem', props: {value: 'profile', onSelect: undefined}, children: 'View Profile'},
      ],
    },
  },
};

export const docsZh = {
  name: 'CommandPaletteList',
  isHiddenFromOverview: true,
  displayName: 'Command Palette List',
  description: '可滚动的结果容器。作为 listbox 渲染以符合 ARIA 规范。',
  propDescriptions: {
    children: '条目、分组和空状态。',
    label: 'listbox 的无障碍标签。',
    xstyle: 'StyleX 布局自定义样式。必须是 stylex.create() 的值。',
  },
};

export const docsDense = {
  name: 'CommandPaletteList',
  isHiddenFromOverview: true,
  displayName: 'Command Palette List',
  description: 'scrollable results container; role=listbox',
  propDescriptions: {
    children: 'items, groups, empty states',
    label: 'a11y label for listbox',
    xstyle: 'StyleX layout styles; must be stylex.create() value',
  },
};
