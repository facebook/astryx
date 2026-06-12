// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'GridSpan',
  subComponentOf: 'Grid',
  displayName: 'Grid Span',
  isHiddenFromOverview: true,
  description: 'Grid item that spans multiple columns or rows.',
  props: [
    {
      name: 'columns',
      type: "number | 'full'",
      description: "Columns to span; use `'full'` to span the entire row.",
    },
    {
      name: 'rows',
      type: 'number',
      description: 'Rows to span.',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Content.',
    },
  ],
};

export const docsZh = {
  name: 'GridSpan',
  isHiddenFromOverview: true,
  displayName: 'Grid Span',
  description: '可跨越多列或多行的网格项。',
  props: [
    {
      name: 'columns',
      type: "number | 'full'",
      description: "要跨越的列数；使用 `'full'` 跨越整行。",
    },
    {
      name: 'rows',
      type: 'number',
      description: '要跨越的行数。',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: '内容。',
    },
  ],
};

export const docsDense = {
  name: 'GridSpan',
  isHiddenFromOverview: true,
  displayName: 'Grid Span',
  description: 'Grid item spanning multiple columns/rows.',
  propDescriptions: {
    columns: "Columns to span; 'full' spans entire row.",
    rows: 'Rows to span.',
    children: 'Content.',
  },
};
