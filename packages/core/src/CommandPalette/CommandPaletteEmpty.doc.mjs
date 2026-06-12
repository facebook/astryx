// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'CommandPaletteEmpty',
  subComponentOf: 'CommandPalette',
  displayName: 'Command Palette Empty',
  isHiddenFromOverview: true,
  description: 'Empty state display for the results area. Rendered automatically by XDSCommandPalette for no-results and no-query states.',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Message or content to display.',
      required: true,
    },
  ],
};

export const docsZh = {
  name: 'CommandPaletteEmpty',
  isHiddenFromOverview: true,
  displayName: 'Command Palette Empty',
  description: '结果区域的空状态展示。由 XDSCommandPalette 在无结果和无查询状态下自动渲染。',
  propDescriptions: {
    children: '要显示的消息或内容。',
  },
};

export const docsDense = {
  name: 'CommandPaletteEmpty',
  isHiddenFromOverview: true,
  displayName: 'Command Palette Empty',
  description: 'empty state; auto-rendered by palette for no-results+no-query states',
  propDescriptions: {
    children: 'message or content to display',
  },
};
