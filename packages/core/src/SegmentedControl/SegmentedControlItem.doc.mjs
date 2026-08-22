// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'SegmentedControlItem',
  subComponentOf: 'SegmentedControl',
  displayName: 'Segmented Control Item',
  isHiddenFromOverview: true,
  description: 'Individual segment item rendering as a radio button within the segmented control.',
  // SegmentedControlItem requires SegmentedControl context; wrap it so the preview doesn't throw.
  playground: {
    defaults: {value: 'item-1', label: 'Item'},
    wrapper: {
      component: 'SegmentedControl',
      props: {value: 'item-1', label: 'Segmented control'},
    },
  },
  props: [
    {
      name: 'value',
      type: 'string',
      description: 'Unique value for this segment, matched against the parent value.',
      required: true,
    },
    {
      name: 'label',
      type: 'string',
      description: 'Accessible label for this segment. Rendered as visible text unless isLabelHidden is true.',
      required: true,
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description: 'Whether the label is visually hidden. When true, only the icon is displayed and label is used as aria-label.',
      default: 'false',
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description: 'Icon element displayed before the label.',
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
      name: 'count',
      type: 'number',
      description: 'How many items this segment holds, rendered after the label and shown even when isLabelHidden makes the segment icon-only. Hidden from assistive technology and folded into the accessible name instead (pair it with countLabel). Rendered as given, 0 included; pass undefined for no count.',
    },
    {
      name: 'countLabel',
      type: 'string',
      description: 'What count counts, used to build the accessible name — "Inbox, 12 unread". Without it the name is just "Inbox, 12". Ignored when count is not set.',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: 'Whether this individual item is disabled.',
      default: 'false',
    },
  ],
};

export const docsZh = {
  name: 'SegmentedControlItem',
  isHiddenFromOverview: true,
  displayName: 'Segmented Control Item',
  description: '单个分段项，在分段控件中渲染为单选按钮。',
  propDescriptions: {
    value: '该分段的唯一值，与父组件的 value 匹配。',
    label: '该分段的无障碍标签。除非 isLabelHidden 为 true，否则渲染为可见文本。',
    isLabelHidden: '是否在视觉上隐藏标签。为 true 时仅显示图标，label 用作 aria-label。',
    icon: '显示在标签前的图标元素。',
    count: '该分段包含的条目数，渲染在标签之后（即使 isLabelHidden 为 true 也会显示）。数字对辅助技术隐藏，改为并入无障碍名称，请搭配 countLabel 使用。',
    countLabel: 'count 所计数的对象，用于构建无障碍名称，例如“收件箱，12 条未读”。',
    isDisabled: '是否禁用该单个项。',
  },
};

export const docsDense = {
  name: 'SegmentedControlItem',
  isHiddenFromOverview: true,
  displayName: 'Segmented Control Item',
  description: 'individual segment; renders as radio button in control',
  propDescriptions: {
    value: 'unique segment value; matched against parent',
    label: 'segment label; visible unless isLabelHidden',
    isLabelHidden: 'hides label visually; label becomes aria-label',
    icon: 'icon before label',
    isDisabled: 'disables this item',
  },
};
