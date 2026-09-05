// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'CollapsibleGroup',
  subComponentOf: 'Collapsible',
  displayName: 'Collapsible Group',
  isHiddenFromOverview: true,
  description: 'Coordinates multiple Collapsible instances so only one (single mode) or any number (multiple mode) can be open at a time. Renders no wrapper DOM element unless dividers are enabled.',
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
      name: 'hasDividers',
      type: 'boolean',
      description: "Whether to draw hairline dividers between the group's items. When set, the group renders a wrapper div and items default to 'balanced' density. Pair with bare Collapsible children; Card-wrapped items provide their own separation.",
      default: 'false',
    },
    {
      name: 'density',
      type: "'compact' | 'balanced' | 'spacious'",
      description: "Row density controlling trigger and content block padding on the group's items. Defaults to 'balanced' when dividers are shown; otherwise items keep their default unpadded look.",
    },
    {
      name: 'chevronPlacement',
      type: "'start' | 'end' | 'none'",
      description: "Which side of the trigger the items' chevrons sit on, or 'none' to draw none and let each trigger carry its own affordance. Set here rather than per item: a list whose arrows change sides row to row reads as a mistake. An individual Collapsible can still override it.",
      default: "'end'",
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Collapsible instances to coordinate.',
      required: true,
      slotElements: [
        {
          __element: 'Collapsible',
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
  description: '协调多个 Collapsible 实例，使同一时间只有一个（single 模式）或任意数量（multiple 模式）可以展开。除非启用 dividers，否则不渲染包裹 DOM 元素。',
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
      name: 'hasDividers',
      type: 'boolean',
      description: "是否在组项目之间绘制细线分隔线。启用后组会渲染一个包裹 div，且项目默认使用 'balanced' 密度。适合搭配裸 Collapsible 子项使用；用 Card 包裹的项目自带视觉分隔。",
      default: 'false',
    },
    {
      name: 'density',
      type: "'compact' | 'balanced' | 'spacious'",
      description: "控制组内项目触发器和内容块内边距的行密度。显示分隔线时默认为 'balanced'；否则项目保持默认的无内边距外观。",
    },
    {
      name: 'chevronPlacement',
      type: "'start' | 'end' | 'none'",
      description: "组内项目箭头位于触发器的哪一侧，或用 'none' 完全不绘制箭头，由触发器自行提供提示。建议在此统一设置而非逐项设置：同一列表中箭头左右不一致会显得像缺陷。单个 Collapsible 仍可覆盖此设置。",
      default: "'end'",
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: '需要协调的 Collapsible 实例。',
      required: true,
    },
  ],
};

export const docsDense = {
  name: 'CollapsibleGroup',
  isHiddenFromOverview: true,
  displayName: 'Collapsible Group',
  description: 'coordinates multiple Collapsible instances; single or multiple open. no wrapper DOM unless dividers enabled.',
  propDescriptions: {
    type: 'one or many items open simultaneously',
    defaultValue: 'default open item(s) (uncontrolled); string for single, array for multiple',
    value: 'controlled open item(s)',
    onChange: 'callback on open items change',
    hasDividers: "draw hairline dividers between items; enables wrapper div + 'balanced' density; use bare Collapsible children",
    density: "row padding 'compact' | 'balanced' | 'spacious'; defaults 'balanced' with dividers, else unpadded",
    chevronPlacement: "chevron side for items: 'end' (default, trailing) | 'start' (leading disclosure arrow, TreeList glyph) | 'none' (no chevron; trigger supplies its own affordance); per-item prop wins",
    children: 'Collapsible instances to coordinate',
  },
};
