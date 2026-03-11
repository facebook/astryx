/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Skeleton',
  description:
    'A placeholder loading component that displays an animated pulsing effect while content is loading.',
  features: [
    'Pulsing Animation: Smooth opacity animation using stepped timing for a subtle shimmer effect',
    'Staggered Animation: Sequential skeletons can be staggered to create a wave effect',
    'High Contrast Support: Automatically adjusts for users with prefers-contrast: more',
    'Flexible Sizing: Width and height props accept pixels or any CSS value',
    'Token-aligned Radius: Border radius options map directly to design tokens',
  ],
  props: [
    {
      name: 'width',
      type: 'number | string',
      description: 'Width in pixels (number) or CSS value (string).',
      default: "'100%'",
    },
    {
      name: 'height',
      type: 'number | string',
      description: 'Height in pixels (number) or CSS value (string).',
      default: "'100%'",
    },
    {
      name: 'radius',
      type: "'none' | 'inner' | 'content' | 'element' | 'container' | 'rounded'",
      description:
        'Border radius using design tokens. Use none for sharp corners, rounded for fully rounded (avatars, pills, circles).',
      default: "'container'",
    },
    {
      name: 'index',
      type: 'number',
      description:
        'Index for staggered animation timing. For element at index n, animation starts at DELAY_TIME + (STAGGER_TIME × n).',
      default: '0',
    },
  ],
  examples: [
    {
      label: 'Basic text placeholder',
      code: '<XDSSkeleton width={200} height={16} />',
    },
    {
      label: 'Circular avatar placeholder',
      code: '<XDSSkeleton width={40} height={40} radius="rounded" />',
    },
    {
      label: 'Full-width with percentage',
      code: '<XDSSkeleton width="100%" height={20} />',
    },
    {
      label: 'Staggered animation for multiple skeletons',
      code: `<div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
  <XDSSkeleton width={300} height={16} index={0} />
  <XDSSkeleton width={280} height={16} index={1} />
  <XDSSkeleton width={320} height={16} index={2} />
</div>`,
    },
  ],
  theming: {
    targets: [
      {className: 'xds-skeleton'},
    ],
  },
  notes: [
    'Uses steps(10, end) timing function for a subtle shimmer effect.',
    'Animation alternates between 0.25 and 1.0 opacity.',
    'Background color comes from the glimmer token, with glimmerHighContrast for accessibility.',
    'Numeric dimensions are converted to pixels; strings are passed through as-is.',
    'Animation timing constants: DELAY_TIME (1000ms) initial delay before animation starts, FADE_TIME (1000ms) duration of one opacity cycle, STAGGER_TIME (100ms) delay increment between sequential elements.',
  ],
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {...docs};
