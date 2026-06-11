// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'ListItem',
  subComponentOf: 'List',
  displayName: 'List Item',
  isHiddenFromOverview: true,
  description: 'List item with label, description, start/end content slots, and interactive patterns.',
  props: [
    {
      name: 'label',
      type: 'string',
      description: 'Primary text.',
      required: true,
    },
    {
      name: 'description',
      type: 'ReactNode',
      description: 'Secondary content below the label. A plain string gets single-line truncation automatically; a ReactNode lets child components control their own wrapping and line-clamp behavior.',
    },
    {
      name: 'startContent',
      type: 'ReactNode',
      description: 'Content rendered before the label area (e.g. icon, avatar).',
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
      description: 'Content rendered after the label area (e.g. badge, chevron).',
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
    {
      name: 'onClick',
      type: '(e: MouseEvent) => void',
      description: 'Click handler; enables the invisible button pattern.',
    },
    {
      name: 'href',
      type: 'string',
      description: 'Link URL; enables the invisible anchor pattern.',
    },
    {
      name: 'target',
      type: 'string',
      description: 'Link target attribute, only applicable when href is provided. target="_blank" automatically adds noopener noreferrer.',
    },
    {
      name: 'rel',
      type: 'string',
      description: 'Link relationship tokens. noopener noreferrer are merged automatically for target="_blank".',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: 'Disabled state; sets aria-disabled on the item.',
      default: 'false',
    },
    {
      name: 'isSelected',
      type: 'boolean',
      description: 'Selected state; sets aria-selected on the item.',
      default: 'false',
    },
  ],
};

export const docsZh = {
  name: 'ListItem',
  isHiddenFromOverview: true,
  displayName: 'List Item',
  description: '列表项，包含标签、描述、起始/结束内容插槽和交互模式。',
  props: [
    {
      name: 'label',
      type: 'string',
      description: '主要文本。',
      required: true,
    },
    {
      name: 'description',
      type: 'ReactNode',
      description: '标签下方的次要内容。纯字符串会自动应用单行截断；ReactNode 允许子组件自行控制换行和多行截断行为。',
    },
    {
      name: 'startContent',
      type: 'ReactNode',
      description: '在标签区域之前渲染的内容（如图标、头像）。',
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description: '在标签区域之后渲染的内容（如徽章、箭头）。',
    },
    {
      name: 'onClick',
      type: '(e: MouseEvent) => void',
      description: '点击处理函数；启用隐形按钮模式。',
    },
    {
      name: 'href',
      type: 'string',
      description: '链接 URL；启用隐形锚点模式。',
    },
    {
      name: 'target',
      type: 'string',
      description: '链接 target 属性，仅在提供 href 时适用。target="_blank" 会自动添加 noopener noreferrer。',
    },
    {
      name: 'rel',
      type: 'string',
      description: '链接关系标记。target="_blank" 会自动合并 noopener noreferrer。',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '禁用状态；在项目上设置 aria-disabled。',
      default: 'false',
    },
    {
      name: 'isSelected',
      type: 'boolean',
      description: '选中状态；在项目上设置 aria-selected。',
      default: 'false',
    },
  ],
};

export const docsDense = {
  name: 'ListItem',
  isHiddenFromOverview: true,
  displayName: 'List Item',
  description: 'List item w/ label, description, start/end content slots, interactive patterns.',
  propDescriptions: {
    label: 'Primary text.',
    description: 'Secondary text below label.',
    startContent: 'Content before label area (e.g. icon, avatar).',
    endContent: 'Content after label area (e.g. badge, chevron).',
    onClick: 'Click handler; enables invisible button pattern.',
    href: 'Link URL; enables invisible anchor pattern.',
    target: 'Link target attribute, only when href provided. target="_blank" auto-adds noopener noreferrer.',
    rel: 'Link relationship tokens. noopener noreferrer are merged for target="_blank".',
    isDisabled: 'Disabled state; sets aria-disabled.',
    isSelected: 'Selected state; sets aria-selected.',
  },
};
