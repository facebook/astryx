/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'ProgressBar',
  description:
    'A progress bar for displaying determinate or indeterminate progress.',
  showcase: {
    aspectRatio: 16 / 4,
    code: '<XDSProgressBar label="Loading" value={60} />',
  },
  keywords: ["progressbar","progress","loader","loading","linear","determinate","indeterminate","meter"],
  features: [
    'Determinate mode uses role="meter" with aria-valuenow, aria-valuemin, and aria-valuemax',
    'Indeterminate mode uses role="progressbar" without value attributes',
    'Label is always connected via aria-labelledby',
    'aria-valuetext provides human-readable value description (determinate only)',
    'Indeterminate animation respects prefers-reduced-motion',
    'Supports four semantic color variants: accent, positive, warning, negative',
    'Single track height: 8px',
    'Supports custom value label formatter via formatValueLabel',
    'Compose additional labels, status icons, and descriptions outside the component — ProgressBar is intentionally minimal',
  ],
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
      type: "'accent' | 'positive' | 'warning' | 'negative'",
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
  notes: [
    'ProgressBar is intentionally minimal — it handles the meter/track and an optional value label. For additional context like descriptions, status icons, or custom label placements, compose them alongside the bar using layout components.',
    'Do not add props for label placement, progress descriptions, or embedded icons. These are composition concerns, not meter concerns.',
  ],
  accessibility: [
    'Determinate: uses role="meter" with aria-valuenow, aria-valuemin, aria-valuemax',
    'Indeterminate: uses role="progressbar" without value attributes',
    'Label is always connected via aria-labelledby',
    'aria-valuetext provides human-readable value description (determinate only)',
    'Indeterminate animation respects prefers-reduced-motion',
  ],
  usage: {
    summary: 'Displays determinate or indeterminate progress of a process.',
    content: `## When to use

- Showing completion progress of a known-length operation.
- Indicating an indeterminate loading state with a known container size.`,
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'ProgressBar',
  description:
    '用于显示确定或不确定进度的进度条组件。',
  features: [
    '确定模式使用 role="meter"，配合 aria-valuenow、aria-valuemin 和 aria-valuemax',
    '不确定模式使用 role="progressbar"，不包含值属性',
    '标签始终通过 aria-labelledby 关联',
    'aria-valuetext 提供人类可读的值描述（仅限确定模式）',
    '不确定动画遵循 prefers-reduced-motion 偏好设置',
    '支持四种语义颜色变体：accent、positive、warning、negative',
    '单一轨道高度：8px',
    '支持通过 formatValueLabel 自定义值标签格式化器',
  ],
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
      type: "'accent' | 'positive' | 'warning' | 'negative'",
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
  accessibility: [
    '确定模式：使用 role="meter"，配合 aria-valuenow、aria-valuemin、aria-valuemax',
    '不确定模式：使用 role="progressbar"，不包含值属性',
    '标签始终通过 aria-labelledby 关联',
    'aria-valuetext 提供人类可读的值描述（仅限确定模式）',
    '不确定动画遵循 prefers-reduced-motion 偏好设置',
  ],
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'Progress bar for displaying determinate or indeterminate progress.',
  features: [
    'Determinate mode uses role="meter" w/ aria-valuenow, aria-valuemin, aria-valuemax',
    'Indeterminate mode uses role="progressbar" w/o value attributes',
    'Label always connected via aria-labelledby',
    'aria-valuetext provides human-readable value description (determinate only)',
    'Indeterminate animation respects prefers-reduced-motion',
    'Supports four semantic color variants: accent, positive, warning, negative',
    'Single track height: 8px',
    'Supports custom value label formatter via formatValueLabel',
  ],
  accessibility: [
    'Determinate: uses role="meter" w/ aria-valuenow, aria-valuemin, aria-valuemax',
    'Indeterminate: uses role="progressbar" w/o value attributes',
    'Label always connected via aria-labelledby',
    'aria-valuetext provides human-readable value description (determinate only)',
    'Indeterminate animation respects prefers-reduced-motion',
  ],
  propDescriptions: {
    label: 'Accessible label (required).',
    value: 'Current value (ignored when indeterminate).',
    max: 'Maximum value.',
    isLabelHidden: 'Visually hide label (remains accessible).',
    hasValueLabel: 'Show formatted value text (ignored when indeterminate).',
    formatValueLabel: 'Custom value label formatter; defaults to percentage string.',
    variant: 'Semantic color variant.',
    isIndeterminate: 'Animated loading indicator for unknown progress.',
    xstyle: 'StyleX styles for layout customization. Must be stylex.create() value.',
  },
};
