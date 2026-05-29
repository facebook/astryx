// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Slider',
  displayName: 'Slider',
  category: 'Inputs',
  keywords: ["slider","range","slidebar","trackbar","scrubber","knob","thumb","rangeslider"],
  playground: {
    defaults: {
      label: 'Volume',
      value: 50,
    },
  },
  props: [
    {
      name: 'label',
      type: 'string',
      description: 'Label text (always rendered for accessibility).',
      required: true,
    },
    {
      name: 'value',
      type: 'number | [number, number]',
      description:
        'Current value — a `number` for single thumb mode or `[number, number]` for range mode.',
      required: true,
    },
    {
      name: 'onChange',
      type: '(value: number) => void | (value: [number, number]) => void',
      description: 'Callback fired on value change during drag.',
    },
    {
      name: 'onChangeEnd',
      type: '(value: number) => void | (value: [number, number]) => void',
      description: 'Callback fired when drag ends.',
    },
    {
      name: 'min',
      type: 'number',
      description: 'Minimum value.',
      default: '0',
    },
    {
      name: 'max',
      type: 'number',
      description: 'Maximum value.',
      default: '100',
    },
    {
      name: 'step',
      type: 'number',
      description: 'Step increment.',
      default: '1',
    },
    {
      name: 'orientation',
      type: "'horizontal' | 'vertical'",
      description: 'Orientation of the slider.',
      default: "'horizontal'",
    },
    {
      name: 'formatValue',
      type: '(value: number) => string',
      description:
        'Custom value formatting function used for display and `aria-valuetext`.',
    },
    {
      name: 'valueDisplay',
      type: "'tooltip' | 'text' | 'none'",
      description: 'How the current value is displayed.',
      default: "'tooltip'",
    },
    {
      name: 'marks',
      type: 'Array<{ value: number; label?: string }>',
      description: 'Tick marks at specified positions with optional labels.',
    },
    {
      name: 'minStepsBetweenThumbs',
      type: 'number',
      description:
        'Minimum number of steps between thumbs in range mode; prevents thumbs from overlapping.',
      default: '0',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: 'Whether the slider is disabled.',
      default: 'false',
    },
    {
      name: 'isOptional',
      type: 'boolean',
      description: 'Whether the field is optional.',
      default: 'false',
    },
    {
      name: 'isRequired',
      type: 'boolean',
      description: 'Whether the field is required.',
      default: 'false',
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
      description: 'Description text rendered below the label.',
    },
    {
      name: 'status',
      type: 'XDSInputStatus',
      description:
        'Status indicator object (`{ type, message }`) for validation feedback.',
    },
    {
      name: 'labelTooltip',
      type: 'string',
      description: 'Tooltip text for an info icon displayed next to the label.',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value — not an inline style object like style={{}}.',
    },
  ],
  theming: {
    targets: [
      {className: 'xds-slider', visualProps: ['orientation'], states: ['disabled']},
      {className: 'xds-slider-track', visualProps: ['orientation']},
      {className: 'xds-slider-thumb', visualProps: ['orientation'], states: ['disabled']},
    ],
  },
  usage: {
    description:
      'A draggable control for selecting a numeric value or range within defined bounds. Supports single value and range selection, tick marks, custom value formatting, and vertical orientation. Use it when users need to explore a continuous range, such as volume, price, or percentage.',
    bestPractices: [
      {guidance: true, description: 'Always provide a label, even if visually hidden, so the slider is accessible to screen readers.'},
      {guidance: true, description: 'Format values with meaningful units like "$50" or "75%" instead of raw numbers.'},
      {guidance: false, description: 'Use for precise numeric entry — pair with a text input or use NumberInput instead.'},
      {guidance: false, description: 'Set a step size so large that only a few positions are possible — use SegmentedControl or radio buttons instead.'},
    ],
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Slider',
  displayName: 'Slider',
  props: [
    {
      name: 'label',
      type: 'string',
      description: '标签文本（始终渲染以确保无障碍可访问性）。',
      required: true,
    },
    {
      name: 'value',
      type: 'number | [number, number]',
      description:
        '当前值——`number` 用于单滑块模式，`[number, number]` 用于范围模式。',
      required: true,
    },
    {
      name: 'onChange',
      type: '(value: number) => void | (value: [number, number]) => void',
      description: '拖拽过程中值变更时触发的回调。',
    },
    {
      name: 'onChangeEnd',
      type: '(value: number) => void | (value: [number, number]) => void',
      description: '拖拽结束时触发的回调。',
    },
    {
      name: 'min',
      type: 'number',
      description: '最小值。',
      default: '0',
    },
    {
      name: 'max',
      type: 'number',
      description: '最大值。',
      default: '100',
    },
    {
      name: 'step',
      type: 'number',
      description: '步进增量。',
      default: '1',
    },
    {
      name: 'orientation',
      type: "'horizontal' | 'vertical'",
      description: '滑块的方向。',
      default: "'horizontal'",
    },
    {
      name: 'formatValue',
      type: '(value: number) => string',
      description:
        '自定义值格式化函数，用于显示和 `aria-valuetext`。',
    },
    {
      name: 'valueDisplay',
      type: "'tooltip' | 'text' | 'none'",
      description: '当前值的显示方式。',
      default: "'tooltip'",
    },
    {
      name: 'marks',
      type: 'Array<{ value: number; label?: string }>',
      description: '在指定位置的刻度标记，带可选标签。',
    },
    {
      name: 'minStepsBetweenThumbs',
      type: 'number',
      description:
        '范围模式下滑块之间的最小步数；防止滑块重叠。',
      default: '0',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '是否禁用滑块。',
      default: 'false',
    },
    {
      name: 'isOptional',
      type: 'boolean',
      description: '字段是否为可选。',
      default: 'false',
    },
    {
      name: 'isRequired',
      type: 'boolean',
      description: '字段是否为必填。',
      default: 'false',
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
      description: '标签下方渲染的描述文本。',
    },
    {
      name: 'status',
      type: 'XDSInputStatus',
      description:
        '验证反馈的状态指示器对象（`{ type, message }`）。',
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
  theming: {
    targets: [
      {className: 'xds-slider', visualProps: ['orientation'], states: ['disabled']},
      {className: 'xds-slider-track', visualProps: ['orientation']},
      {className: 'xds-slider-thumb', visualProps: ['orientation'], states: ['disabled']},
    ],
  },
  usage: {
    description:
      'A draggable control for selecting a numeric value or range within defined bounds. Supports single value and range selection, tick marks, custom value formatting, and vertical orientation. Use it when users need to explore a continuous range, such as volume, price, or percentage.',
    bestPractices: [
      {guidance: true, description: 'Always provide a label, even if visually hidden, so the slider is accessible to screen readers.'},
      {guidance: true, description: 'Format values with meaningful units like "$50" or "75%" instead of raw numbers.'},
      {guidance: false, description: 'Use for precise numeric entry — pair with a text input or use NumberInput instead.'},
      {guidance: false, description: 'Set a step size so large that only a few positions are possible — use SegmentedControl or radio buttons instead.'},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  usage: {
    description:
      'A draggable control for selecting a numeric value or range within defined bounds. Supports single value and range selection, tick marks, custom value formatting, and vertical orientation. Use it when users need to explore a continuous range, such as volume, price, or percentage.',
    bestPractices: [
      {guidance: true, description: 'Always provide a label, even if visually hidden, so the slider is accessible to screen readers.'},
      {guidance: true, description: 'Format values with meaningful units like "$50" or "75%" instead of raw numbers.'},
      {guidance: false, description: 'Use for precise numeric entry — pair with a text input or use NumberInput instead.'},
      {guidance: false, description: 'Set a step size so large that only a few positions are possible — use SegmentedControl or radio buttons instead.'},
    ],
  },
  propDescriptions: {
    label: 'Label text (always rendered for a11y).',
    value: 'Current value; number for single thumb, [number, number] for range.',
    onChange: 'Fired on value change during drag.',
    onChangeEnd: 'Fired when drag ends.',
    min: 'Minimum value.',
    max: 'Maximum value.',
    step: 'Step increment.',
    orientation: 'Slider orientation.',
    formatValue: 'Custom value formatting fn for display + aria-valuetext.',
    valueDisplay: 'How current value is displayed.',
    marks: 'Tick marks at specified positions w/ optional labels.',
    minStepsBetweenThumbs: 'Min steps between thumbs in range mode; prevents overlap.',
    isDisabled: 'Whether slider is disabled.',
    isOptional: 'Whether field is optional.',
    isRequired: 'Whether field is required.',
    isLabelHidden: 'Visually hide label.',
    description: 'Description text below label.',
    status: 'Status indicator ({type, message}) for validation feedback.',
    labelTooltip: 'Tooltip text for info icon next to label.',
    xstyle: 'StyleX layout styles; must be stylex.create() value.',
  },
};