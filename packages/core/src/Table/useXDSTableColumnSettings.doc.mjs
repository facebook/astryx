// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'useXDSTableColumnSettings',
  subComponentOf: 'Table',
  displayName: 'useXDSTableColumnSettings',
  description: 'Headless column visibility and ordering management for XDSTable. Provides filtered columns, toggle helpers, and pre-built XDSMultiSelector options for a column picker UI.',
  props: [
    {
      name: 'columns',
      type: 'XDSColumnSettingsOption[]',
      description: 'All available columns with metadata for the settings UI. Each entry has key, label, optional isAlwaysVisible and group.',
      required: true,
    },
    {
      name: 'activeColumnKeys',
      type: 'string[]',
      description: 'Currently active column keys, in display order. Only columns with keys in this array are shown.',
      required: true,
    },
    {
      name: 'onChangeActiveColumnKeys',
      type: '(keys: string[]) => void',
      description: 'Called when active columns change (toggle, reorder).',
      required: true,
    },
    {
      name: 'defaultColumnKeys',
      type: 'string[]',
      description: 'Default column set for "Reset to default". When omitted, reset shows all columns.',
    },
  ],
};

export const docsZh = {
  name: 'useXDSTableColumnSettings',
  displayName: 'useXDSTableColumnSettings',
  description: '无头列可见性和排序管理。提供筛选后的列、切换帮助方法和 XDSMultiSelector 选项。',
  props: [
    {
      name: 'columns',
      type: 'XDSColumnSettingsOption[]',
      description: '所有可用列及其设置 UI 的元数据。每个条目包含 key、label、可选的 isAlwaysVisible 和 group。',
      required: true,
    },
    {
      name: 'activeColumnKeys',
      type: 'string[]',
      description: '当前活动的列键，按显示顺序排列。',
      required: true,
    },
    {
      name: 'onChangeActiveColumnKeys',
      type: '(keys: string[]) => void',
      description: '活动列更改时调用。',
      required: true,
    },
  ],
};

export const docsDense = {
  name: 'useXDSTableColumnSettings',
  displayName: 'useXDSTableColumnSettings',
  description: 'Headless column visibility/ordering. Provides filtered columns, toggle helpers, XDSMultiSelector options.',
  propDescriptions: {
    columns: 'All available columns w/ metadata (key, label, isAlwaysVisible, group).',
    activeColumnKeys: 'Active column keys in display order.',
    onChangeActiveColumnKeys: 'Called on column toggle/reorder.',
    defaultColumnKeys: 'Default column set for reset. Omit = show all.',
  },
};
