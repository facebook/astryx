// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'RadioListItem',
  subComponentOf: 'RadioList',
  displayName: 'Radio List Item',
  isHiddenFromOverview: true,
  description: 'Individual radio item with label, description, and content slots.',
  props: [
    {
      name: 'label',
      type: 'string',
      description: 'Label text for the radio item.',
      required: true,
    },
    {
      name: 'value',
      type: 'string',
      description: 'Value of this radio item.',
      required: true,
    },
    {
      name: 'description',
      type: 'string',
      description: 'Description text displayed below the label.',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: 'Whether this individual radio item is disabled.',
      default: 'false',
    },
    {
      name: 'startContent',
      type: 'ReactNode',
      description: 'Content to render before the radio circle.',
      slotElements: [
        {
          __element: 'XDSIcon',
          props: {
            icon: 'check',
            size: 'sm',
          },
        },
      ],
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description: 'Content to render after the label.',
      slotElements: [
        {
          __element: 'XDSIcon',
          props: {
            icon: 'chevronDown',
            size: 'sm',
          },
        },
        {
          __element: 'XDSBadge',
          props: {
            label: '3',
          },
        },
      ],
    },
  ],
};

export const docsZh = {
  name: 'RadioListItem',
  isHiddenFromOverview: true,
  displayName: 'Radio List Item',
  description: '单个单选选项，包含标签、描述和内容插槽。',
  props: [
    {
      name: 'label',
      type: 'string',
      description: '单选选项的标签文本。',
      required: true,
    },
    {
      name: 'value',
      type: 'string',
      description: '此单选选项的值。',
      required: true,
    },
    {
      name: 'description',
      type: 'string',
      description: '显示在标签下方的描述文本。',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '是否禁用此单个单选选项。',
      default: 'false',
    },
    {
      name: 'startContent',
      type: 'ReactNode',
      description: '在单选圆圈前渲染的内容。',
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description: '在标签后渲染的内容。',
    },
  ],
};

export const docsDense = {
  name: 'RadioListItem',
  isHiddenFromOverview: true,
  displayName: 'Radio List Item',
  description: 'Individual radio item w/ label, description, content slots.',
  propDescriptions: {
    label: 'Label text for radio item.',
    value: 'Value of this radio item.',
    description: 'Description text below label.',
    isDisabled: 'Whether this individual radio item disabled.',
    startContent: 'Content rendered before radio circle.',
    endContent: 'Content rendered after label.',
  },
};
