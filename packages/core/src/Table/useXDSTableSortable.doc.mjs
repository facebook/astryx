// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'useXDSTableSortable',
  subComponentOf: 'Table',
  displayName: 'useXDSTableSortable',
  description: 'Headless multi-sort plugin for XDSTable. The consumer owns sort state and provides a callback. Shift+click enables secondary sort columns. Sort indicators render in header cells automatically.',
  props: [
    {
      name: 'sort',
      type: 'XDSTableSortState<TSortKey>',
      description: 'Current sort state. Ordered array of {sortKey, direction} entries. First entry is the primary sort.',
      required: true,
    },
    {
      name: 'onSortChange',
      type: '(sort: XDSTableSortState<TSortKey>) => void',
      description: 'Called when the user clicks a header cell to change sort.',
      required: true,
    },
    {
      name: 'allowUnsortedState',
      type: 'boolean',
      description: 'Allow cycling back to unsorted. When true: asc, desc, unsorted. When false: asc, desc, asc.',
      default: 'false',
    },
    {
      name: 'isMultiSortEnabled',
      type: 'boolean',
      description: 'Enable multi-sort via Shift+click. Regular click still replaces the entire sort state.',
      default: 'false',
    },
  ],
};

export const docsZh = {
  name: 'useXDSTableSortable',
  displayName: 'useXDSTableSortable',
  description: '无头多列排序插件。用户拥有排序状态并提供回调。Shift+点击启用二级排序列。排序指示器自动渲染在表头单元格中。',
  props: [
    {
      name: 'sort',
      type: 'XDSTableSortState<TSortKey>',
      description: '当前排序状态。{sortKey, direction} 条目的有序数组。第一个条目是主排序。',
      required: true,
    },
    {
      name: 'onSortChange',
      type: '(sort: XDSTableSortState<TSortKey>) => void',
      description: '用户点击表头单元格更改排序时调用。',
      required: true,
    },
    {
      name: 'allowUnsortedState',
      type: 'boolean',
      description: '允许循环回到未排序状态。为 true 时：升序、降序、未排序。为 false 时：升序、降序、升序。',
      default: 'false',
    },
    {
      name: 'isMultiSortEnabled',
      type: 'boolean',
      description: '通过 Shift+点击启用多列排序。普通点击仍替换整个排序状态。',
      default: 'false',
    },
  ],
};

export const docsDense = {
  name: 'useXDSTableSortable',
  displayName: 'useXDSTableSortable',
  description: 'Headless multi-sort plugin. Consumer owns sort state + callback. Shift+click for secondary sort. Sort indicators auto-render in header cells.',
  propDescriptions: {
    sort: 'Current sort state; ordered array of {sortKey, direction} entries.',
    onSortChange: 'Called on header click to change sort.',
    allowUnsortedState: 'Allow cycling to unsorted. true: asc>desc>unsorted. false: asc>desc>asc.',
    isMultiSortEnabled: 'Enable multi-sort via Shift+click. Regular click replaces sort state.',
  },
};
