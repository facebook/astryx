// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'RadioControl',
  subComponentOf: 'RadioList',
  displayName: 'Radio Control',
  isHiddenFromOverview: true,
  description:
    'The standalone radio control primitive: the native radio input plus its circle and dot. Renders only the control (no visible label), so it composes into custom surfaces — cards, table cells, bespoke rows — without a RadioList. Composed by RadioListItem for the labeled/grouped case.',
  // Documented here so a standalone consumer can discover the theme targets
  // from the control's own page. The themingTargets guard validates the call
  // sites against the directory doc (RadioList.doc.mjs); this block is the
  // human-facing surface for the primitive.
  theming: {
    targets: [
      {
        className: 'astryx-radio',
        visualProps: ['size'],
        states: ['checked', 'disabled'],
      },
      {className: 'astryx-radio-dot', visualProps: ['size']},
    ],
  },
  playground: {
    defaults: {
      label: 'Option',
      htmlName: 'radio-control',
      value: 'option-1',
      isChecked: true,
    },
  },
  props: [
    {
      name: 'label',
      type: 'string',
      description:
        'Accessible name, applied as aria-label. Required so a standalone control always has a name (mirrors the icon-only Button convention: label becomes aria-label when there is no visible text). Pair the control with your own visible text for a labeled option.',
      required: true,
    },
    {
      name: 'isChecked',
      type: 'boolean',
      description: 'Whether the radio is selected (controlled).',
      required: true,
    },
    {
      name: 'onChange',
      type: '(value: string, e: ChangeEvent<HTMLInputElement>) => void',
      description:
        'Fired with the selected value and the change event when the user selects this radio. No-op while disabled.',
      required: true,
    },
    {
      name: 'value',
      type: 'string',
      description: 'The value reported when this radio is selected.',
      required: true,
    },
    {
      name: 'htmlName',
      type: 'string',
      description:
        'The HTML name shared by the radio group so the browser single-selects within it. When omitted, a unique name is generated so a lone control behaves as its own group.',
    },
    {
      name: 'size',
      type: "'sm' | 'md'",
      description: 'Size of the radio control.',
      default: "'md'",
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: 'Whether the radio is disabled.',
      default: 'false',
    },
    {
      name: 'isRequired',
      type: 'boolean',
      description: 'Whether the radio is required.',
      default: 'false',
    },
    {
      name: 'disabledMessage',
      type: 'string',
      description:
        'Explains why the radio is disabled. With isDisabled, shows a tooltip on hover and keyboard focus and keeps the control focusable (via aria-disabled) so the reason is AT-discoverable. Selection stays blocked. Mirrors CheckboxInput.',
    },
    {
      name: 'id',
      type: 'string',
      description:
        'Id applied to the input so an external <label htmlFor> can also target it. When omitted, a unique id is generated.',
    },
  ],
};

export const docsZh = {
  name: 'RadioControl',
  isHiddenFromOverview: true,
  displayName: 'Radio Control',
  description:
    '独立的单选控件基础组件：原生单选输入及其圆圈和圆点。仅渲染控件本身（无可见标签），因此可组合进卡片、表格单元格、自定义行等界面，无需 RadioList。由 RadioListItem 组合用于带标签/分组的场景。',
  theming: {
    targets: [
      {
        className: 'astryx-radio',
        visualProps: ['size'],
        states: ['checked', 'disabled'],
      },
      {className: 'astryx-radio-dot', visualProps: ['size']},
    ],
  },
  props: [
    {
      name: 'label',
      type: 'string',
      description:
        '无障碍名称，作为 aria-label。必填，使独立控件始终有名称（沿用仅图标 Button 约定：无可见文本时 label 作为 aria-label）。请为控件搭配可见文本以形成带标签的选项。',
      required: true,
    },
    {
      name: 'isChecked',
      type: 'boolean',
      description: '单选按钮是否被选中（受控）。',
      required: true,
    },
    {
      name: 'onChange',
      type: '(value: string, e: ChangeEvent<HTMLInputElement>) => void',
      description:
        '用户选择此单选按钮时触发，回调参数为 value 和变更事件。禁用时不触发。',
      required: true,
    },
    {
      name: 'value',
      type: 'string',
      description: '选中此单选按钮时上报的值。',
      required: true,
    },
    {
      name: 'htmlName',
      type: 'string',
      description:
        '单选组共享的 HTML name，使浏览器在组内单选。省略时自动生成唯一 name，使单个控件作为自己的组。',
    },
    {
      name: 'size',
      type: "'sm' | 'md'",
      description: '单选控件的尺寸。',
      default: "'md'",
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '是否禁用单选按钮。',
      default: 'false',
    },
    {
      name: 'isRequired',
      type: 'boolean',
      description: '是否为必填。',
      default: 'false',
    },
    {
      name: 'disabledMessage',
      type: 'string',
      description:
        '说明单选按钮为何被禁用。配合 isDisabled 时，在悬停和键盘聚焦时显示提示，并通过 aria-disabled 保持可聚焦，使原因可被辅助技术发现。选择仍被阻止。与 CheckboxInput 一致。',
    },
    {
      name: 'id',
      type: 'string',
      description:
        '应用于输入的 id，使外部 <label htmlFor> 也可定位。省略时自动生成唯一 id。',
    },
  ],
};

export const docsDense = {
  name: 'RadioControl',
  isHiddenFromOverview: true,
  displayName: 'Radio Control',
  description:
    'Standalone radio control primitive (input + circle + dot). No visible label; composes into custom surfaces. Used by RadioListItem.',
  propDescriptions: {
    label: 'Accessible name (aria-label). Required.',
    isChecked: 'Whether the radio is selected (controlled).',
    onChange: 'Fired w/ (value, event) on select. No-op while disabled.',
    value: 'Value reported when selected.',
    htmlName: 'HTML name shared by the radio group (generated if omitted).',
    size: 'Size of the radio control.',
    isDisabled: 'Whether the radio is disabled.',
    isRequired: 'Whether the radio is required.',
    disabledMessage:
      'Reason shown (tooltip) when disabled; keeps the control focusable for AT.',
    id: 'Id for the input so an external <label htmlFor> can target it.',
  },
};
