// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'CommandPaletteGroup',
  subComponentOf: 'CommandPalette',
  displayName: 'Command Palette Group',
  isHiddenFromOverview: true,
  description: 'Visual grouping with a heading label. Place inside XDSCommandPaletteList.',
  props: [
    {
      name: 'heading',
      type: 'string',
      description: 'Group heading text.',
      required: true,
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: 'XDSCommandPaletteItem children.',
      required: true,
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: 'StyleX styles for layout customization. Must be a stylex.create() value.',
    },
  ],
};

export const docsZh = {
  name: 'CommandPaletteGroup',
  isHiddenFromOverview: true,
  displayName: 'Command Palette Group',
  description: '带标题标签的视觉分组。放置在 XDSCommandPaletteList 内。',
  propDescriptions: {
    heading: '分组标题文本。',
    children: 'XDSCommandPaletteItem 子元素。',
    xstyle: 'StyleX 布局自定义样式。必须是 stylex.create() 的值。',
  },
};

export const docsDense = {
  name: 'CommandPaletteGroup',
  isHiddenFromOverview: true,
  displayName: 'Command Palette Group',
  description: 'group w/ heading label; inside XDSCommandPaletteList',
  propDescriptions: {
    heading: 'group heading text',
    children: 'XDSCommandPaletteItem children',
    xstyle: 'StyleX layout styles; must be stylex.create() value',
  },
};
