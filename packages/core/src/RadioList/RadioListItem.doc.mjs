// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'RadioListItem',
  subComponentOf: 'RadioList',
  displayName: 'Radio List Item',
  isHiddenFromOverview: true,
  description: 'Individual radio item with label, description, and content slots.',
  // RadioListItem requires RadioList context; wrap it so the preview doesn't throw.
  playground: {
    defaults: {value: 'option-1', label: 'Option'},
    wrapper: {
      component: 'RadioList',
      props: {value: 'option-1', label: 'Radio list'},
    },
  },
  props: [
    {
      name: 'label',
      type: 'ReactNode',
      description:
        'Primary label for the radio item. A rich (ReactNode) label still names the radio from its own text; pair it with aria-label when that text does not read well on its own.',
      required: true,
    },
    {
      name: 'aria-label',
      type: 'string',
      description:
        'Plain-text accessible name for the radio, applied to the control rather than the row. It overrides whatever the label element computes — a plain string label included — so reach for it when a rich label\u2019s own text is absent or reads badly.',
    },
    {
      name: 'value',
      type: 'string',
      description: 'Value of this radio item.',
      required: true,
    },
    {
      name: 'description',
      type: 'ReactNode',
      description:
        'Secondary content displayed below the label. Links and buttons keep their own click behaviour — the row only delegates clicks from its non-interactive surface to the radio.',
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
          __element: 'Icon',
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
      type: 'ReactNode',
      description:
        '单选选项的主标签。富文本（ReactNode）标签仍会根据其自身文本为单选框命名；若该文本不适合单独朗读，请同时传入 aria-label。',
      required: true,
    },
    {
      name: 'aria-label',
      type: 'string',
      description:
        '单选框的纯文本无障碍名称，应用于控件本身而非整行。它会覆盖标签元素计算出的名称（包括纯字符串标签），因此仅在富文本标签自身缺少文本或朗读效果不佳时使用。',
    },
    {
      name: 'value',
      type: 'string',
      description: '此单选选项的值。',
      required: true,
    },
    {
      name: 'description',
      type: 'ReactNode',
      description:
        '显示在标签下方的次要内容。链接和按钮保留自身的点击行为——整行仅将非交互区域的点击委派给单选框。',
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
    label: 'Primary label for radio item. String or ReactNode.',
    'aria-label': 'Plain-text radio name; overrides any label.',
    value: 'Value of this radio item.',
    description: 'Secondary content below label. String or ReactNode.',
    isDisabled: 'Whether this individual radio item disabled.',
    startContent: 'Content rendered before radio circle.',
    endContent: 'Content rendered after label.',
  },
};
