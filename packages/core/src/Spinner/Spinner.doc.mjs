/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Spinner',
  description:
    'A pure spinner component for indicating loading state. No layout, no text — just the spinning indicator.',
  features: [
    'CSS Border Animation: Lightweight border-based spinner with smooth 360° rotation',
    'Size Variants: Three sizes (sm, md, lg) matching existing inline spinners',
    'Shade Support: Default shade for light backgrounds, onMedia for dark/accent backgrounds',
    'Accessible: role="status" and aria-label="Loading" by default',
  ],
  props: [
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: 'Spinner size (10px, 14px, 18px).',
      default: "'md'",
    },
    {
      name: 'shade',
      type: "'default' | 'onMedia'",
      description: 'Color shade for light or dark backgrounds.',
      default: "'default'",
    },
  ],
  examples: [
    {
      label: 'Default',
      code: `<XDSSpinner />`,
    },
    {
      label: 'Small',
      code: `<XDSSpinner size="sm" />`,
    },
    {
      label: 'Large on dark background',
      code: `<XDSSpinner size="lg" shade="onMedia" />`,
    },
    {
      label: 'Composing with layout and text',
      code: `<XDSVStack gap={2} align="center">
  <XDSSpinner size="lg" />
  <XDSText color="secondary">Loading...</XDSText>
</XDSVStack>`,
    },
  ],
  theming: {
    targets: [
      {className: 'xds-spinner', visualProps: ['size']},
    ],
  },
  notes: [
    'Uses CSS border technique: three visible borders + one transparent for the gap.',
    'Animation: rotate(360deg) at 0.75s linear infinite.',
    'Color inherits from currentColor, controlled by shade styles using theme tokens.',
    'Element is a <span> with display: inline-block for inline composability.',
    'XDSSpinner is intentionally minimal — compose with layout and text components for full loading states.',
    'Size reference: sm = 10×10px / 3px border, md = 14×14px / 3px border, lg = 18×18px / 3px border.',
  ],
};
