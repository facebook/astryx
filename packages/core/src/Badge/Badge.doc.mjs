/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Badge',
  description:
    'A badge component for displaying status indicators, counts, or labels.',
  props: [
    {
      name: 'variant',
      type: "'neutral' | 'info' | 'success' | 'warning' | 'error'",
      description: 'Visual style variant.',
      default: "'neutral'",
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Badge content. Omit for dot indicator.',
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description: 'Optional leading icon.',
    },
  ],
  examples: [
    {
      label: 'Text badge',
      code: '<XDSBadge>Default</XDSBadge>',
    },
    {
      label: 'Status variants',
      code: `<XDSBadge variant="success">Active</XDSBadge>
<XDSBadge variant="error">Failed</XDSBadge>
<XDSBadge variant="warning">Pending</XDSBadge>`,
    },
    {
      label: 'Count badge',
      code: '<XDSBadge variant="info">42</XDSBadge>',
    },
    {
      label: 'Dot indicator (no children)',
      code: '<XDSBadge variant="success" />',
    },
  ],
  theming: {
    componentKey: 'badge',
    surfaces: [
      {
        name: 'root',
        description: 'Root badge styles.',
      },
      {
        name: 'variants',
        description:
          'Per-variant overrides (Partial<Record<XDSBadgeVariant, StyleXStyles>>).',
      },
    ],
  },
};
