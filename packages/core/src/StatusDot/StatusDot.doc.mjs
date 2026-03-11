/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'StatusDot',
  description:
    'A small colored dot indicator for status display (online/offline, severity, etc).',
  features: [
    'Five semantic color variants: positive, warning, negative, info, neutral',
    'Two sizes: sm (8px) and md (10px)',
    'Optional pulse animation that respects prefers-reduced-motion',
    'Accessible — renders as <span role="img" aria-label={label}> for screen reader support',
    'Not focusable (decorative indicator)',
  ],
  props: [
    {
      name: 'variant',
      type: "'positive' | 'warning' | 'negative' | 'info' | 'neutral'",
      description: 'Semantic color variant.',
      required: true,
    },
    {
      name: 'label',
      type: 'string',
      description: 'Accessible label surfaced via aria-label.',
      required: true,
    },
    {
      name: 'size',
      type: "'sm' | 'md'",
      description: 'Dot size: sm=8px, md=10px.',
      default: "'md'",
    },
    {
      name: 'isPulsing',
      type: 'boolean',
      description:
        'Enables a pulse animation; respects prefers-reduced-motion: reduce.',
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
      label: 'Basic status indicators',
      code: `<XDSStatusDot variant="positive" label="Online" />
<XDSStatusDot variant="negative" label="Offline" />
<XDSStatusDot variant="warning" label="Away" />`,
    },
    {
      label: 'Small size',
      code: `<XDSStatusDot variant="positive" label="Active" size="sm" />`,
    },
    {
      label: 'Pulsing animation',
      code: `<XDSStatusDot variant="positive" label="Live" isPulsing />`,
    },
  ],
  theming: {
    targets: [
      {className: 'xds-statusdot', visualProps: ['size', 'variant']},
    ],
  },
  accessibility: [
    'Renders as <span role="img" aria-label={label}> for screen reader support.',
    'Not focusable — intended as a decorative indicator only.',
    'isPulsing animation respects prefers-reduced-motion: reduce.',
  ],
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {...docs};
