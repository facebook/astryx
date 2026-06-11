// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'useXDSTableFilterState',
  subComponentOf: 'Table',
  displayName: 'useXDSTableFilterState',
  isHiddenFromOverview: true,
  description: 'Managed state hook for table filtering. Returns the current filter map and an onChange handler. Pass the result directly to useXDSTableFiltering.',
  props: [
    {
      name: 'initialState',
      type: 'XDSTableFilterState',
      description: 'Optional initial filter state map.',
    },
  ],
};

export const docsZh = {
  name: 'useXDSTableFilterState',
  isHiddenFromOverview: true,
  displayName: 'useXDSTableFilterState',
  description: '表格筛选的受管状态 hook。返回当前筛选映射和 onChange 处理程序。将结果直接传递给 useXDSTableFiltering。',
  props: [
    {
      name: 'initialState',
      type: 'XDSTableFilterState',
      description: '可选的初始筛选状态映射。',
    },
  ],
};

export const docsDense = {
  name: 'useXDSTableFilterState',
  isHiddenFromOverview: true,
  displayName: 'useXDSTableFilterState',
  description: 'Managed filter state hook. Returns filter map + onChange handler for useXDSTableFiltering.',
  propDescriptions: {
    initialState: 'Optional initial filter state map.',
  },
};
