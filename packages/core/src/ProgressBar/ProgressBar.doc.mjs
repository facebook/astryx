/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'ProgressBar',
  description:
    'A progress bar for displaying determinate or indeterminate progress.',
  features: [
    'Determinate mode uses role="meter" with aria-valuenow, aria-valuemin, and aria-valuemax',
    'Indeterminate mode uses role="progressbar" without value attributes',
    'Label is always connected via aria-labelledby',
    'aria-valuetext provides human-readable value description (determinate only)',
    'Indeterminate animation respects prefers-reduced-motion',
    'Supports four semantic color variants: accent, positive, warning, negative',
    'Three track height sizes: sm=4px, md=8px, lg=12px',
    'Supports custom value label formatter via formatValueLabel',
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
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: 'Track height: sm=4px, md=8px, lg=12px.',
      default: "'md'",
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
  examples: [
    {
      label: 'Determinate progress bar',
      code: `<XDSProgressBar value={75} label="Upload progress" />`,
    },
    {
      label: 'With visible value label',
      code: `<XDSProgressBar value={75} label="Storage used" hasValueLabel />`,
    },
    {
      label: 'Custom value label formatter',
      code: `<XDSProgressBar
  value={3.2}
  max={5}
  label="Disk usage"
  hasValueLabel
  formatValueLabel={(value, max) => \`\${value} GB / \${max} GB\`}
/>`,
    },
    {
      label: 'Indeterminate loading',
      code: `<XDSProgressBar isIndeterminate label="Loading..." />`,
    },
    {
      label: 'Variant and size',
      code: `<XDSProgressBar value={92} label="Disk" variant="negative" size="sm" />`,
    },
    {
      label: 'Hidden label (accessible but not visible)',
      code: `<XDSProgressBar value={50} label="Loading" isLabelHidden />`,
    },
  ],
  theming: {
    targets: [
      {className: 'xds-progressbar', visualProps: ['size', 'variant']},
    ],
  },
  accessibility: [
    'Determinate: uses role="meter" with aria-valuenow, aria-valuemin, aria-valuemax',
    'Indeterminate: uses role="progressbar" without value attributes',
    'Label is always connected via aria-labelledby',
    'aria-valuetext provides human-readable value description (determinate only)',
    'Indeterminate animation respects prefers-reduced-motion',
  ],
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
    '三种轨道高度尺寸：sm=4px、md=8px、lg=12px',
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
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: '轨道高度：sm=4px、md=8px、lg=12px。',
      default: "'md'",
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
  examples: [
    {
      label: '确定进度条',
      code: `<XDSProgressBar value={75} label="Upload progress" />`,
    },
    {
      label: '带可见值标签',
      code: `<XDSProgressBar value={75} label="Storage used" hasValueLabel />`,
    },
    {
      label: '自定义值标签格式化器',
      code: `<XDSProgressBar
  value={3.2}
  max={5}
  label="Disk usage"
  hasValueLabel
  formatValueLabel={(value, max) => \`\${value} GB / \${max} GB\`}
/>`,
    },
    {
      label: '不确定加载',
      code: `<XDSProgressBar isIndeterminate label="Loading..." />`,
    },
    {
      label: '变体和尺寸',
      code: `<XDSProgressBar value={92} label="Disk" variant="negative" size="sm" />`,
    },
    {
      label: '隐藏标签（无障碍可访问但不可见）',
      code: `<XDSProgressBar value={50} label="Loading" isLabelHidden />`,
    },
  ],
  theming: {
    targets: [
      {className: 'xds-progressbar', visualProps: ['size', 'variant']},
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

/** @type {string} */
export const docsDense = `import{XDSProgressBar}from'@xds/core/ProgressBar' //determinate or indeterminate progress bar
P label:string! accessible label | value:number='0' current value (ignored when indeterminate) | max:number='100' maximum value | isLabelHidden:boolean='false' visually hide label, remains accessible | hasValueLabel:boolean='false' show formatted value text (ignored when indeterminate) | formatValueLabel:(value: number, max: number) => string custom formatter; defaults to percentage | variant:'accent' | 'positive' | 'warning' | 'negative'='accent' semantic color | size:'sm' | 'md' | 'lg'='md' track height: sm=4px, md=8px, lg=12px | isIndeterminate:boolean='false' animated loading for unknown progress | xstyle:StyleXStyles stylex.create() layout styles
X <XDSProgressBar value={75} label="Upload progress" /> | <XDSProgressBar value={75} label="Storage used" hasValueLabel /> | <XDSProgressBar
  value={3.2}
  max={5}
  label="Disk usage"
  hasValueLabel
  formatValueLabel={(value, max) => \\\`\\\${value} GB / \\\${max} GB\\\`}
/> | <XDSProgressBar isIndeterminate label="Loading..." /> | <XDSProgressBar value={92} label="Disk" variant="negative" size="sm" /> | <XDSProgressBar value={50} label="Loading" isLabelHidden />
A determinate: role="meter" w/ aria-valuenow, aria-valuemin, aria-valuemax|indeterminate: role="progressbar" w/o value attributes|label always connected via aria-labelledby|aria-valuetext provides human-readable value desc (determinate only)|indeterminate animation respects prefers-reduced-motion
N determinate uses role="meter" w/ aria-valuenow, aria-valuemin, aria-valuemax|indeterminate uses role="progressbar" w/o value attributes|label always connected via aria-labelledby|aria-valuetext for human-readable value (determinate only)|indeterminate animation respects prefers-reduced-motion|4 semantic color variants: accent, positive, warning, negative|3 track heights: sm=4px, md=8px, lg=12px|custom value label formatter via formatValueLabel`;
