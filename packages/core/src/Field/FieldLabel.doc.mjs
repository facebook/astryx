// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'FieldLabel',
  subComponentOf: 'Field',
  displayName: 'Field Label',
  isHiddenFromOverview: true,
  description: 'Standalone label component with optional/required indicators and tooltip support.',
  props: [
    {
      name: 'label',
      type: 'string',
      description: 'Label text.',
      required: true,
    },
    {
      name: 'inputID',
      type: 'string',
      description: 'ID of the input this label is for.',
      required: true,
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description: 'Visually hide the label.',
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: 'Whether the associated input is disabled.',
      default: 'false',
    },
    {
      name: 'isOptional',
      type: 'boolean',
      description: 'Show "Optional" indicator.',
      default: 'false',
    },
    {
      name: 'isRequired',
      type: 'boolean',
      description: 'Show "Required" indicator.',
      default: 'false',
    },
    {
      name: 'labelIcon',
      type: 'XDSIconType',
      description: 'Icon before the label text. See `npx xds docs icons` for valid semantic names.',
    },
    {
      name: 'labelTooltip',
      type: 'string',
      description: 'Tooltip text for info icon at end of label.',
    },
  ],
};

export const docsZh = {
  name: 'FieldLabel',
  isHiddenFromOverview: true,
  displayName: 'Field Label',
  description: '独立的标签组件，支持可选/必填指示器和工具提示。',
  props: [
    {
      name: 'label',
      type: 'string',
      description: '标签文本。',
      required: true,
    },
    {
      name: 'inputID',
      type: 'string',
      description: '此标签关联的输入框 ID。',
      required: true,
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description: '视觉隐藏标签。',
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '关联的输入框是否禁用。',
      default: 'false',
    },
    {
      name: 'isOptional',
      type: 'boolean',
      description: '显示"Optional"指示器。',
      default: 'false',
    },
    {
      name: 'isRequired',
      type: 'boolean',
      description: '显示"Required"指示器。',
      default: 'false',
    },
    {
      name: 'labelIcon',
      type: 'XDSIconType',
      description: '标签文本前的图标。',
    },
    {
      name: 'labelTooltip',
      type: 'string',
      description: '标签末尾信息图标的工具提示文本。',
    },
  ],
};

export const docsDense = {
  name: 'FieldLabel',
  isHiddenFromOverview: true,
  displayName: 'Field Label',
  description: 'Standalone label w/ optional/required indicators + tooltip support.',
  propDescriptions: {
    label: 'Label text.',
    inputID: 'ID of input this label is for.',
    isLabelHidden: 'Visually hide label.',
    isDisabled: 'Associated input disabled.',
    isOptional: 'Show "Optional" indicator.',
    isRequired: 'Show "Required" indicator.',
    labelIcon: 'Icon before label text.',
    labelTooltip: 'Tooltip text for info icon at end of label.',
  },
};
