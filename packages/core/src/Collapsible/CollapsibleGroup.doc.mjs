// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'CollapsibleGroup',
  subComponentOf: 'Collapsible',
  displayName: 'Collapsible Group',
  isHiddenFromOverview: true,
  description: 'Coordinates multiple XDSCollapsible instances so only one (single mode) or any number (multiple mode) can be open at a time. Renders no wrapper DOM element.',
  props: [
    {
      name: 'type',
      type: "'single' | 'multiple'",
      description: 'Whether one or many items can be open simultaneously.',
      default: "'single'",
    },
    {
      name: 'defaultValue',
      type: 'string | string[]',
      description: 'Default open item(s) for uncontrolled usage. Use a string for single mode and an array for multiple mode.',
    },
    {
      name: 'value',
      type: 'string | string[]',
      description: 'Controlled open item(s).',
    },
    {
      name: 'onChange',
      type: '(value: string | string[]) => void',
      description: 'Callback invoked when the set of open items changes.',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: 'XDSCollapsible instances to coordinate.',
      required: true,
      slotElements: [
        {
          __element: 'XDSCollapsible',
          props: {
            trigger: 'Section',
          },
          children: 'Content',
        },
      ],
    },
  ],
};

export const docsZh = {
  name: 'CollapsibleGroup',
  isHiddenFromOverview: true,
  displayName: 'Collapsible Group',
  description: '协调多个 XDSCollapsible 实例，使同一时间只有一个（single 模式）或任意数量（multiple 模式）可以展开。不渲染包裹 DOM 元素。',
  props: [
    {
      name: 'type',
      type: "'single' | 'multiple'",
      description: '是否允许同时展开一个或多个项目。',
      default: "'single'",
    },
    {
      name: 'defaultValue',
      type: 'string | string[]',
      description: '非受控模式下默认展开的项目。single 模式使用字符串，multiple 模式使用数组。',
    },
    {
      name: 'value',
      type: 'string | string[]',
      description: '受控展开的项目。',
    },
    {
      name: 'onChange',
      type: '(value: string | string[]) => void',
      description: '展开项目集合变更时调用的回调。',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: '需要协调的 XDSCollapsible 实例。',
      required: true,
    },
  ],
};

export const docsDense = {
  name: 'CollapsibleGroup',
  isHiddenFromOverview: true,
  displayName: 'Collapsible Group',
  description: 'coordinates multiple XDSCollapsible instances; single or multiple open. no wrapper DOM.',
  propDescriptions: {
    type: 'one or many items open simultaneously',
    defaultValue: 'default open item(s) (uncontrolled); string for single, array for multiple',
    value: 'controlled open item(s)',
    onChange: 'callback on open items change',
    children: 'XDSCollapsible instances to coordinate',
  },
};
