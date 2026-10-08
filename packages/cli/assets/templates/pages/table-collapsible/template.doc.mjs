// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').TemplateDoc} */
export const doc = {
  type: 'page',
  name: 'Collapsible Table',
  displayName: 'Collapsible Table',
  description:
    'Several independent tables on one page, each inside a collapsible card with its own columns — for groups that do not share a schema, where a single table would stand full of empty cells. One time-range selector drives them all, and each row expands into a detail chart. Use this instead of Grouped Table when each group needs different columns.',
  keywords: [
    'collapsible',
    'accordion',
    'expand collapse',
    'multiple tables',
    'different columns',
    'heterogeneous',
    'detail chart',
  ],
  isReady: true,
  category: 'Table - Grouped',
};
