// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'useXDSTableSelection',
  subComponentOf: 'Table',
  displayName: 'useXDSTableSelection',
  description: 'Hook that returns a TablePlugin implementing row selection with checkboxes, select-all, and aria-selected. Uses React Context for independent checkbox re-renders.',
  props: [
    {
      name: 'getIsItemSelected',
      type: '(item: T) => boolean',
      description: 'Returns whether the given item is currently selected.',
      required: true,
    },
    {
      name: 'onSelectItem',
      type: '(event: {item: T; isSelected: boolean}) => void',
      description: 'Called when a row checkbox is toggled. isSelected is the new desired state.',
      required: true,
    },
    {
      name: 'onSelectAll',
      type: '(event: {isAllSelected: boolean}) => void',
      description: 'Called when the select-all header checkbox is toggled.',
      required: true,
    },
    {
      name: 'getIsAllSelected',
      type: '() => boolean',
      description: 'Returns whether all selectable items are currently selected.',
      required: true,
    },
    {
      name: 'getIsIndeterminate',
      type: '() => boolean',
      description: 'Returns whether selection is partial (some but not all). Renders the select-all checkbox in indeterminate state.',
    },
    {
      name: 'getIsItemSelectable',
      type: '(item: T) => boolean',
      description: 'Returns whether a row should show a checkbox. Non-selectable rows render nothing in the selection cell.',
      default: '() => true',
    },
    {
      name: 'getIsItemEnabled',
      type: '(item: T) => boolean',
      description: 'Returns whether a row checkbox is interactive. Disabled rows show a disabled checkbox.',
      default: '() => true',
    },
  ],
};

export const docsZh = {
  name: 'useXDSTableSelection',
  displayName: 'useXDSTableSelection',
  description: '返回 TablePlugin 的 Hook，实现带复选框、全选和 aria-selected 的行选择功能。使用 React Context 实现独立的复选框重新渲染。',
  props: [
    {
      name: 'getIsItemSelected',
      type: '(item: T) => boolean',
      description: '返回给定项是否当前被选中。',
      required: true,
    },
    {
      name: 'onSelectItem',
      type: '(event: {item: T; isSelected: boolean}) => void',
      description: '当行复选框被切换时调用。isSelected 为新的期望状态。',
      required: true,
    },
    {
      name: 'onSelectAll',
      type: '(event: {isAllSelected: boolean}) => void',
      description: '当全选表头复选框被切换时调用。',
      required: true,
    },
    {
      name: 'getIsAllSelected',
      type: '() => boolean',
      description: '返回所有可选择项是否当前都被选中。',
      required: true,
    },
    {
      name: 'getIsIndeterminate',
      type: '() => boolean',
      description: '返回选择是否为部分选中（部分但非全部）。将全选复选框渲染为不确定状态。',
    },
    {
      name: 'getIsItemSelectable',
      type: '(item: T) => boolean',
      description: '返回行是否应显示复选框。不可选择的行在选择单元格中不渲染任何内容。',
      default: '() => true',
    },
    {
      name: 'getIsItemEnabled',
      type: '(item: T) => boolean',
      description: '返回行复选框是否可交互。禁用的行显示禁用状态的复选框。',
      default: '() => true',
    },
  ],
};

export const docsDense = {
  name: 'useXDSTableSelection',
  displayName: 'useXDSTableSelection',
  description: 'Hook returning TablePlugin for row selection w/ checkboxes, select-all, aria-selected. Uses React Context for independent checkbox re-renders.',
  propDescriptions: {
    getIsItemSelected: 'Returns whether item is selected.',
    onSelectItem: 'Called on row checkbox toggle; isSelected = new desired state.',
    onSelectAll: 'Called on select-all header checkbox toggle.',
    getIsAllSelected: 'Returns whether all selectable items are selected.',
    getIsIndeterminate: 'Returns partial selection state; renders indeterminate checkbox.',
    getIsItemSelectable: 'Returns whether row shows checkbox; non-selectable rows render nothing.',
    getIsItemEnabled: 'Returns whether row checkbox is interactive; disabled rows show disabled checkbox.',
  },
};
