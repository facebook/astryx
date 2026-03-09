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
