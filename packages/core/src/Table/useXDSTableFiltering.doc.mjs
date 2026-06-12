// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'useXDSTableFiltering',
  subComponentOf: 'Table',
  displayName: 'useXDSTableFiltering',
  isHiddenFromOverview: true,
  description: 'Table plugin that adds inline column filters with popover or inline controls. Pairs with useXDSTableFilterState for managed state. Supports text, select, multi-select, date, and number filter types via PowerSearch field definitions.',
  props: [
    {
      name: 'filters',
      type: 'XDSTableFilterState',
      description: 'Current filter state — map from column key to filter value.',
      required: true,
    },
    {
      name: 'onFilterChange',
      type: '(columnKey: string, value: XDSTableFilterValue | null) => void',
      description: 'Called when the user changes a filter value. null clears the filter.',
      required: true,
    },
    {
      name: 'variant',
      type: "'popover' | 'inline'",
      description: 'Display variant for filter controls.',
      default: "'popover'",
    },
  ],
};

export const docsZh = {
  name: 'useXDSTableFiltering',
  isHiddenFromOverview: true,
  displayName: 'useXDSTableFiltering',
  description: '表格筛选插件，添加内联列过滤器（弹出式或内联控件）。与 useXDSTableFilterState 配合使用管理状态。',
  props: [
    {
      name: 'filters',
      type: 'XDSTableFilterState',
      description: '当前筛选状态——列键到筛选值的映射。',
      required: true,
    },
    {
      name: 'onFilterChange',
      type: '(columnKey: string, value: XDSTableFilterValue | null) => void',
      description: '用户更改筛选值时调用。null 清除筛选。',
      required: true,
    },
    {
      name: 'variant',
      type: "'popover' | 'inline'",
      description: '筛选控件的显示变体。',
      default: "'popover'",
    },
  ],
};

export const docsDense = {
  name: 'useXDSTableFiltering',
  isHiddenFromOverview: true,
  displayName: 'useXDSTableFiltering',
  description: 'Table filtering plugin — inline column filters (popover/inline). Pairs w/ useXDSTableFilterState.',
  propDescriptions: {
    filters: 'Current filter state map (columnKey → value).',
    onFilterChange: 'Called on filter change. null clears.',
    variant: 'Filter control display variant.',
  },
};
