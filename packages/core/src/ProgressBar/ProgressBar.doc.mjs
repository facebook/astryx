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
      type: "'accent' | 'positive' | 'warning' | 'neutral' | 'negative'",
      description: 'Semantic color variant.',
      default: "'accent'",
    },
    {
      name: 'isIndeterminate',
      type: 'boolean',
      description: 'Animated loading indicator for unknown progress.',
      default: 'false',
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
      'ProgressBar displays the completion progress of a process as a horizontal bar. Use it for determinate operations where the duration is known, or as an indeterminate indicator when progress cannot be calculated.',
    bestPractices: [
      { guidance: true, description: 'Use a determinate bar when the total amount of work is known, and switch to indeterminate only when it is not.' },
      { guidance: true, description: 'Choose a semantic color variant that reflects the nature of the process — accent for neutral, positive for success, warning or negative for alerts.' },
      { guidance: false, description: 'Add custom label placements or status icons inside the bar — compose them alongside using layout components.' },
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
      type: "'accent' | 'positive' | 'warning' | 'neutral' | 'negative'",
      description: '语义颜色变体。',
      default: "'accent'",
    },
    {
      name: 'isIndeterminate',
      type: 'boolean',
      description: '用于未知进度的动画加载指示器。',
      default: 'false',
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
      'ProgressBar displays the completion progress of a process as a horizontal bar. Use it for determinate operations where the duration is known, or as an indeterminate indicator when progress cannot be calculated.',
    bestPractices: [
      { guidance: true, description: 'Use a determinate bar when the total amount of work is known, and switch to indeterminate only when it is not.' },
      { guidance: true, description: 'Choose a semantic color variant that reflects the nature of the process — accent for neutral, positive for success, warning or negative for alerts.' },
      { guidance: false, description: 'Add custom label placements or status icons inside the bar — compose them alongside using layout components.' },
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'Progress bar for displaying determinate or indeterminate progress.',
  usage: {
    description:
      'ProgressBar displays the completion progress of a process as a horizontal bar. Use it for determinate operations where the duration is known, or as an indeterminate indicator when progress cannot be calculated.',
    bestPractices: [
      { guidance: true, description: 'Use a determinate bar when the total amount of work is known, and switch to indeterminate only when it is not.' },
      { guidance: true, description: 'Choose a semantic color variant that reflects the nature of the process — accent for neutral, positive for success, warning or negative for alerts.' },
      { guidance: false, description: 'Add custom label placements or status icons inside the bar — compose them alongside using layout components.' },
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
  },
};
