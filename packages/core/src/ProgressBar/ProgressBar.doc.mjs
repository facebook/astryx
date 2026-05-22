// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'ProgressBar',
  keywords: ["progressbar","progress","loader","loading","linear","determinate","indeterminate","meter"],
  props: [
    {
      name: 'label',
      type: 'string',
      description: 'Accessible label (required).',
      required: true,
    },
    {
      name: 'value',
      type: 'number',
      description: 'Current value (ignored when indeterminate).',
      default: '0',
    },
    {
      name: 'max',
      type: 'number',
      description: 'Maximum value.',
      default: '100',
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description: 'Visually hide the label (remains accessible).',
      default: 'false',
    },
    {
      name: 'hasValueLabel',
      type: 'boolean',
      description: 'Show formatted value text (ignored when indeterminate).',
      default: 'false',
    },
    {
      name: 'formatValueLabel',
      type: '(value: number, max: number) => string',
      description:
        'Custom value label formatter; defaults to a percentage string.',
    },
    {
      name: 'variant',
      type: "'accent' | 'success' | 'warning' | 'error' | 'neutral'",
      description: 'Semantic color variant.',
      default: "'accent'",
    },
    {
      name: 'isIndeterminate',
      type: 'boolean',
      description: 'Animated loading indicator for unknown progress.',
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: 'Visually disabled state — grays out the fill and text. Use for canceled or inactive operations.',
      default: 'false',
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
      {className: 'xds-progressbar', visualProps: ['variant']},
      {className: 'xds-progressbar-fill', visualProps: ['variant']},
    ],
  },
  usage: {
    description:
      'A horizontal bar showing the completion progress of a task. Use it for operations where the duration is known, or as an animated indicator when progress can\'t be calculated. Supports semantic color variants, value labels, and custom formatting.',
    bestPractices: [
      { guidance: true, description: "Use a determinate bar when the total amount of work is known, and indeterminate when it's not." },
      { guidance: true, description: 'Choose a color variant that matches the context — accent for general progress, success for completion, warning or error for alerts.' },
      { guidance: true, description: "Always provide a label, even if hidden — screen readers need it to announce what's loading." },
      { guidance: false, description: 'Place icons or labels inside the bar — compose them alongside it using layout components.' },
      { guidance: false, description: "Use a progress bar for instant actions — it's meant for operations that take noticeable time." },
      { guidance: false, description: 'Use multiple progress bars stacked together for the same operation — use one bar with a value label instead.' },
    ],
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'ProgressBar',
  props: [
    {
      name: 'label',
      type: 'string',
      description: '无障碍标签（必填）。',
      required: true,
    },
    {
      name: 'value',
      type: 'number',
      description: '当前值（不确定模式下忽略）。',
      default: '0',
    },
    {
      name: 'max',
      type: 'number',
      description: '最大值。',
      default: '100',
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description: '视觉上隐藏标签（仍保持无障碍可访问性）。',
      default: 'false',
    },
    {
      name: 'hasValueLabel',
      type: 'boolean',
      description: '显示格式化的值文本（不确定模式下忽略）。',
      default: 'false',
    },
    {
      name: 'formatValueLabel',
      type: '(value: number, max: number) => string',
      description:
        '自定义值标签格式化器；默认为百分比字符串。',
    },
    {
      name: 'variant',
      type: "'accent' | 'success' | 'warning' | 'error' | 'neutral'",
      description: '语义颜色变体。',
      default: "'accent'",
    },
    {
      name: 'isIndeterminate',
      type: 'boolean',
      description: '用于未知进度的动画加载指示器。',
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '视觉禁用状态——使填充条和文本变灰。用于已取消或不活跃的操作。',
      default: 'false',
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
      {className: 'xds-progressbar', visualProps: ['variant']},
      {className: 'xds-progressbar-fill', visualProps: ['variant']},
    ],
  },
  usage: {
    description:
      'A horizontal bar showing the completion progress of a task. Use it for operations where the duration is known, or as an animated indicator when progress can\'t be calculated. Supports semantic color variants, value labels, and custom formatting.',
    bestPractices: [
      { guidance: true, description: "Use a determinate bar when the total amount of work is known, and indeterminate when it's not." },
      { guidance: true, description: 'Choose a color variant that matches the context — accent for general progress, success for completion, warning or error for alerts.' },
      { guidance: true, description: "Always provide a label, even if hidden — screen readers need it to announce what's loading." },
      { guidance: false, description: 'Place icons or labels inside the bar — compose them alongside it using layout components.' },
      { guidance: false, description: "Use a progress bar for instant actions — it's meant for operations that take noticeable time." },
      { guidance: false, description: 'Use multiple progress bars stacked together for the same operation — use one bar with a value label instead.' },
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'Progress bar for displaying determinate or indeterminate progress.',
  usage: {
    description:
      'A horizontal bar showing the completion progress of a task. Use it for operations where the duration is known, or as an animated indicator when progress can\'t be calculated. Supports semantic color variants, value labels, and custom formatting.',
    bestPractices: [
      { guidance: true, description: "Use a determinate bar when the total amount of work is known, and indeterminate when it's not." },
      { guidance: true, description: 'Choose a color variant that matches the context — accent for general progress, success for completion, warning or error for alerts.' },
      { guidance: true, description: "Always provide a label, even if hidden — screen readers need it to announce what's loading." },
      { guidance: false, description: 'Place icons or labels inside the bar — compose them alongside it using layout components.' },
      { guidance: false, description: "Use a progress bar for instant actions — it's meant for operations that take noticeable time." },
      { guidance: false, description: 'Use multiple progress bars stacked together for the same operation — use one bar with a value label instead.' },
    ],
  },
  propDescriptions: {
    label: 'Accessible label (required).',
    value: 'Current value (ignored when indeterminate).',
    max: 'Maximum value.',
    isLabelHidden: 'Visually hide label (remains accessible).',
    hasValueLabel: 'Show formatted value text (ignored when indeterminate).',
    formatValueLabel: 'Custom value label formatter; defaults to percentage string.',
    variant: 'Semantic color variant.',
    isIndeterminate: 'Animated loading indicator for unknown progress.',
    isDisabled: 'Visually disabled — grays out fill and text.',
    xstyle: 'StyleX styles for layout customization. Must be stylex.create() value.',
  },
};
