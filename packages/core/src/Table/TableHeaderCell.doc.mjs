// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'TableHeaderCell',
  subComponentOf: 'Table',
  displayName: 'Table Header Cell',
  isHiddenFromOverview: true,
  description: '<th> wrapper that reads XDSTableContext to apply density padding, semibold weight, secondary text color, and divider borders when used inside XDSTable.',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Header cell content.',
    },
  ],
};

export const docsZh = {
  name: 'TableHeaderCell',
  isHiddenFromOverview: true,
  displayName: 'Table Header Cell',
  description: '<th> 包装器，读取 XDSTableContext 以在 XDSTable 内部使用时应用密度内边距、半粗字重、次要文本颜色和分隔线边框。',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: '表头单元格内容。',
    },
  ],
};

export const docsDense = {
  name: 'TableHeaderCell',
  isHiddenFromOverview: true,
  displayName: 'Table Header Cell',
  description: '<th> wrapper; reads XDSTableContext for density padding, semibold weight, secondary color, dividers.',
  propDescriptions: {
    children: 'Header cell content.',
  },
};
