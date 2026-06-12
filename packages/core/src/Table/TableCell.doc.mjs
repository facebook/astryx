// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'TableCell',
  subComponentOf: 'Table',
  displayName: 'Table Cell',
  isHiddenFromOverview: true,
  description: '<td> wrapper that reads XDSTableContext to apply density padding, font size, and divider borders when used inside XDSTable.',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Cell content.',
    },
  ],
};

export const docsZh = {
  name: 'TableCell',
  isHiddenFromOverview: true,
  displayName: 'Table Cell',
  description: '<td> 包装器，读取 XDSTableContext 以在 XDSTable 内部使用时应用密度内边距、字体大小和分隔线边框。',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: '单元格内容。',
    },
  ],
};

export const docsDense = {
  name: 'TableCell',
  isHiddenFromOverview: true,
  displayName: 'Table Cell',
  description: '<td> wrapper; reads XDSTableContext for density padding, font size, divider borders.',
  propDescriptions: {
    children: 'Cell content.',
  },
};
