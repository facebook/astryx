// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'CheckboxListItem',
  subComponentOf: 'CheckboxList',
  displayName: 'Checkbox List Item',
  isHiddenFromOverview: true,
  description: 'Individual checkbox item with label, description, and end content slot. Works in collection mode (inside CheckboxList) or standalone mode (inside List).',
  // Own playground so this page doesn't inherit CheckboxList's multi-item defaults.
  playground: {
    defaults: {label: 'Email', value: 'email'},
  },
  props: [
    {
      name: 'label',
      type: 'string',
      description: 'Primary text label for the item.',
      required: true,
    },
    {
      name: 'value',
      type: 'string',
      description: 'Identity key (required inside CheckboxList).',
    },
    {
      name: 'description',
      type: 'string',
      description: 'Secondary text below the label.',
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description: 'Content rendered after the label area.',
      slotElements: [
        {
          __element: 'Icon',
          props: {
            icon: 'chevronDown',
            size: 'sm',
          },
        },
        {
          __element: 'Badge',
          props: {
            label: '3',
          },
        },
      ],
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: 'Whether this individual item is disabled.',
      default: 'false',
    },
    {
      name: 'isLoading',
      type: 'boolean',
      description:
        'Whether this item is loading. Shows a spinner inside the checkbox and blocks interaction on this item. In collection mode, the toggled item also shows this automatically while the parent changeAction is pending.',
      default: 'false',
    },
    {
      name: 'isChecked',
      type: "boolean | 'indeterminate'",
      description: 'Direct checked state (standalone mode only).',
    },
    {
      name: 'onCheck',
      type: '(checked: boolean) => void',
      description: 'Direct check handler (standalone mode only).',
    },
  ],
};

export const docsZh = {
  name: 'CheckboxListItem',
  isHiddenFromOverview: true,
  displayName: 'Checkbox List Item',
  description: '单个复选框选项，包含标签、描述和尾部内容插槽。可在集合模式或独立模式下使用。',
  props: [
    {
      name: 'label',
      type: 'string',
      description: '选项的主要文本标签。',
      required: true,
    },
    {
      name: 'value',
      type: 'string',
      description: '标识键（在 CheckboxList 内为必填）。',
    },
    {
      name: 'description',
      type: 'string',
      description: '标签下方的辅助文本。',
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description: '在标签区域后渲染的内容。',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '是否禁用此单个选项。',
      default: 'false',
    },
    {
      name: 'isLoading',
      type: 'boolean',
      description:
        '此选项是否处于加载状态。在复选框内显示加载旋转器并阻止该选项的交互。在集合模式下，当父级 changeAction 处于待定状态时，被切换的选项会自动显示此状态。',
      default: 'false',
    },
    {
      name: 'isChecked',
      type: "boolean | 'indeterminate'",
      description: '直接选中状态（仅独立模式）。',
    },
    {
      name: 'onCheck',
      type: '(checked: boolean) => void',
      description: '直接选中处理器（仅独立模式）。',
    },
  ],
};

export const docsDense = {
  name: 'CheckboxListItem',
  isHiddenFromOverview: true,
  displayName: 'Checkbox List Item',
  description: 'Individual checkbox item w/ label, description, end content slot.',
  propDescriptions: {
    label: 'Primary text label for item.',
    value: 'Identity key (required inside CheckboxList).',
    description: 'Secondary text below label.',
    endContent: 'Content rendered after label area.',
    isDisabled: 'Whether this individual item disabled.',
    isLoading:
      'Item loading: spinner inside checkbox + blocks interaction. Auto-set on toggled item while parent changeAction pending.',
    isChecked: 'Direct checked state (standalone mode only).',
    onCheck: 'Direct check handler (standalone mode only).',
  },
};
