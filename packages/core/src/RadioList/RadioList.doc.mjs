// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'RadioList',
  displayName: 'Radio List',
  group: 'Radio',
  category: 'Inputs',
  keywords: ["radiolist","radio","radiogroup","radiobutton","optionlist","singlechoice","choicelist"],
  theming: {
    targets: [
      {className: 'xds-radio-list', visualProps: ['orientation', 'size']},
      {className: 'xds-radio-list-item'},
      {className: 'xds-radio', visualProps: ['size'], states: ['checked', 'disabled']},
      {className: 'xds-radio-dot', visualProps: ['size']},
    ],
  },
  components: [
    {
      name: 'XDSRadioList',
      displayName: 'Radio List',
      description:
        'Radio group container with field integration for label, description, and status.',      props: [
        {
          name: 'label',
          type: 'string',
          description:
            'Label text for the radio group (always rendered for accessibility).',
          required: true,
        },
        {
          name: 'value',
          type: 'string',
          description: 'The currently selected value.',
          required: true,
        },
        {
          name: 'onChange',
          type: '(value: string) => void',
          description: 'Callback fired when the selected value changes.',
          required: true,
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: 'XDSRadioListItem elements.',
          slotElements: [{__element: 'XDSRadioListItem', props: {label: 'Option', value: 'option'}}],
          required: true,
        },
        {
          name: 'isLabelHidden',
          type: 'boolean',
          description: 'Whether to visually hide the label.',
          default: 'false',
        },
        {
          name: 'description',
          type: 'string',
          description: 'Description text displayed below the label.',
        },
        {
          name: 'orientation',
          type: "'vertical' | 'horizontal'",
          description: 'Layout direction of the radio items.',
          default: "'vertical'",
        },
        {
          name: 'isDisabled',
          type: 'boolean',
          description: 'Whether all radio items are disabled.',
          default: 'false',
        },
        {
          name: 'isRequired',
          type: 'boolean',
          description: 'Whether the radio group is required.',
          default: 'false',
        },
        {
          name: 'isOptional',
          type: 'boolean',
          description:
            'Whether the field is optional (mutually exclusive with isRequired).',
          default: 'false',
        },
        {
          name: 'status',
          type: 'XDSInputStatus',
          description: 'Status indicator ({ type, message }).',
        },
        {
          name: 'size',
          type: "'sm' | 'md'",
          description: 'Size of the radio controls.',
          default: "'md'",
        },
        {
          name: 'labelTooltip',
          type: 'string',
          description: 'Tooltip text for an info icon next to the label.',
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value — not an inline style object like style={{}}.',
        },
      ],
    },
    {
      name: 'XDSRadioListItem',
      displayName: 'Radio List Item',
      description:
        'Individual radio item with label, description, and content slots.',
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
          slotElements: [{__element: 'XDSIcon', props: {icon: 'check', size: 'sm'}}],
        },
        {
          name: 'endContent',
          type: 'ReactNode',
          description: 'Content to render after the label.',
          slotElements: [
            {__element: 'XDSIcon', props: {icon: 'chevronDown', size: 'sm'}},
            {__element: 'XDSBadge', props: {label: '3'}},
          ],
        },
      ],
    },
  ],
  usage: {
    description:
      'A group of options where only one can be selected at a time. All options are visible at once, making it easy to compare choices. Use it when users need to pick one option from a small set.',
    bestPractices: [
      { guidance: true, description: 'Keep the number of options small — typically 2 to 7 choices.' },
      { guidance: true, description: 'Use clear, concise labels that differentiate each option at a glance.' },
      { guidance: true, description: "Pre-select a default option when there's a sensible default — don't leave the group empty unless the choice is truly optional." },
      { guidance: false, description: 'Use when multiple selections are needed — use CheckboxList instead.' },
      { guidance: false, description: 'Use for long lists — use Selector for better discoverability.' },
      { guidance: false, description: 'Use horizontal layout with more than 4 options — it wraps awkwardly.' },
    ],
    anatomy: [
      {name: 'Header', required: false, description: 'Optional heading above the radio list.'},
      {name: 'Children', required: true, description: 'The radio list items rendered as selectable options.'},
      {name: 'Label/Value', required: true, description: 'The text label and associated value for each radio item.'},
    ],
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'RadioList',
  displayName: 'Radio List',
  theming: {
    targets: [
      {className: 'xds-radio-list', visualProps: ['orientation', 'size']},
      {className: 'xds-radio-list-item'},
      {className: 'xds-radio', visualProps: ['size'], states: ['checked', 'disabled']},
      {className: 'xds-radio-dot', visualProps: ['size']},
    ],
  },
  components: [
    {
      name: 'XDSRadioList',
      displayName: 'Radio List',
      description:
        '单选按钮组容器，集成字段功能，支持标签、描述和状态。',
      props: [
        {
          name: 'label',
          type: 'string',
          description:
            '单选按钮组的标签文本（始终渲染以确保无障碍可访问性）。',
          required: true,
        },
        {
          name: 'value',
          type: 'string',
          description: '当前选中的值。',
          required: true,
        },
        {
          name: 'onChange',
          type: '(value: string) => void',
          description: '选中值变更时触发的回调函数。',
          required: true,
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: 'XDSRadioListItem 元素。',
          required: true,
        },
        {
          name: 'isLabelHidden',
          type: 'boolean',
          description: '是否在视觉上隐藏标签。',
          default: 'false',
        },
        {
          name: 'description',
          type: 'string',
          description: '显示在标签下方的描述文本。',
        },
        {
          name: 'orientation',
          type: "'vertical' | 'horizontal'",
          description: '单选选项的布局方向。',
          default: "'vertical'",
        },
        {
          name: 'isDisabled',
          type: 'boolean',
          description: '是否禁用所有单选选项。',
          default: 'false',
        },
        {
          name: 'isRequired',
          type: 'boolean',
          description: '单选按钮组是否为必填。',
          default: 'false',
        },
        {
          name: 'isOptional',
          type: 'boolean',
          description:
            '字段是否为可选（与 isRequired 互斥）。',
          default: 'false',
        },
        {
          name: 'status',
          type: 'XDSInputStatus',
          description: '状态指示器（{ type, message }）。',
        },
        {
          name: 'size',
          type: "'sm' | 'md'",
          description: '单选控件的尺寸。',
          default: "'md'",
        },
        {
          name: 'labelTooltip',
          type: 'string',
          description: '标签旁信息图标的提示文本。',
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            '用于布局自定义的 StyleX 样式（边距、定位、尺寸）。必须是 stylex.create() 的值，而非内联样式对象如 style={{}}。',
        },
      ],
    },
    {
      name: 'XDSRadioListItem',
      displayName: 'Radio List Item',
      description:
        '单个单选选项，包含标签、描述和内容插槽。',
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
    },
  ],
  usage: {
    description:
      'A group of options where only one can be selected at a time. All options are visible at once, making it easy to compare choices. Use it when users need to pick one option from a small set.',
    bestPractices: [
      { guidance: true, description: 'Keep the number of options small — typically 2 to 7 choices.' },
      { guidance: true, description: 'Use clear, concise labels that differentiate each option at a glance.' },
      { guidance: true, description: "Pre-select a default option when there's a sensible default — don't leave the group empty unless the choice is truly optional." },
      { guidance: false, description: 'Use when multiple selections are needed — use CheckboxList instead.' },
      { guidance: false, description: 'Use for long lists — use Selector for better discoverability.' },
      { guidance: false, description: 'Use horizontal layout with more than 4 options — it wraps awkwardly.' },
    ],
    anatomy: [
      {name: 'Header', required: false, description: 'Optional heading above the radio list.'},
      {name: 'Children', required: true, description: 'The radio list items rendered as selectable options.'},
      {name: 'Label/Value', required: true, description: 'The text label and associated value for each radio item.'},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'Radio group component for single-value selection from list of options.',
  usage: {
    description:
      'A group of options where only one can be selected at a time. All options are visible at once, making it easy to compare choices. Use it when users need to pick one option from a small set.',
    bestPractices: [
      { guidance: true, description: 'Keep the number of options small — typically 2 to 7 choices.' },
      { guidance: true, description: 'Use clear, concise labels that differentiate each option at a glance.' },
      { guidance: true, description: "Pre-select a default option when there's a sensible default — don't leave the group empty unless the choice is truly optional." },
      { guidance: false, description: 'Use when multiple selections are needed — use CheckboxList instead.' },
      { guidance: false, description: 'Use for long lists — use Selector for better discoverability.' },
      { guidance: false, description: 'Use horizontal layout with more than 4 options — it wraps awkwardly.' },
    ],
    anatomy: [
      {name: 'Header', required: false, description: 'Optional heading above the radio list.'},
      {name: 'Children', required: true, description: 'The radio list items rendered as selectable options.'},
      {name: 'Label/Value', required: true, description: 'The text label and associated value for each radio item.'},
    ],
  },
  components: [
    {
      name: 'XDSRadioList',
      displayName: 'Radio List',
      description:
        'Radio group container w/ field integration for label, description, status.',
      propDescriptions: {
        label: 'Label text for radio group (always rendered for accessibility).',
        value: 'Currently selected value.',
        onChange: 'Callback fired when selected value changes.',
        children: 'XDSRadioListItem elements.',
        isLabelHidden: 'Whether to visually hide label.',
        description: 'Description text below label.',
        orientation: 'Layout direction of radio items.',
        isDisabled: 'Whether all radio items disabled.',
        isRequired: 'Whether radio group required.',
        isOptional: 'Whether field optional (mutually exclusive w/ isRequired).',
        status: 'Status indicator ({ type, message }).',
        size: 'Size of radio controls.',
        labelTooltip: 'Tooltip text for info icon next to label.',
        xstyle: 'StyleX styles for layout customization. Must be stylex.create() value.',
      },
    },
    {
      name: 'XDSRadioListItem',
      displayName: 'Radio List Item',
      description:
        'Individual radio item w/ label, description, content slots.',
      propDescriptions: {
        label: 'Label text for radio item.',
        value: 'Value of this radio item.',
        description: 'Description text below label.',
        isDisabled: 'Whether this individual radio item disabled.',
        startContent: 'Content rendered before radio circle.',
        endContent: 'Content rendered after label.',
      },
    },
  ],
};
