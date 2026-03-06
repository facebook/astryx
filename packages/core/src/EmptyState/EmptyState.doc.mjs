/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'EmptyState',
  description:
    'An empty state placeholder for content areas with no data. Displays an icon or illustration, title, optional description, and action buttons.',
  features: [
    'Uses role="status" so screen readers announce the empty state automatically',
    'Icon slot renders as decorative (aria-hidden="true") — no extra labeling needed',
    'Title renders as an <h3> heading element for correct document outline',
    'Actions are laid out horizontally by default and stack vertically in compact mode',
    'Compact variant reduces spacing for constrained content areas',
    'Accepts StyleX override styles via xstyle for custom container adjustments',
    'Forwarded ref lands on the root <div> container',
  ],
  examples: [
    {
      label: 'Minimal',
      code: '<XDSEmptyState title="No results found" />',
    },
    {
      label: 'With description',
      code: `<XDSEmptyState
  title="No results found"
  description="Try adjusting your search or filters."
/>`,
    },
    {
      label: 'Full example with icon and action',
      code: `<XDSEmptyState
  icon={<XDSIcon icon={InboxIcon} size="lg" />}
  title="No messages"
  description="You're all caught up!"
  actions={<XDSButton label="Compose" variant="primary" />}
/>`,
    },
    {
      label: 'Compact variant',
      code: `<XDSEmptyState
  title="No items"
  description="Nothing to show here."
  isCompact
/>`,
    },
  ],
  props: [
    {
      name: 'title',
      type: 'string',
      description:
        'Primary message rendered as an <h3> heading inside the empty state.',
      required: true,
    },
    {
      name: 'description',
      type: 'string',
      description:
        'Optional secondary text providing additional context below the title.',
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description:
        'Optional icon or illustration displayed above the title; rendered as decorative (aria-hidden="true").',
    },
    {
      name: 'actions',
      type: 'ReactNode',
      description:
        'Optional action buttons displayed below the description, laid out horizontally by default and stacked vertically when isCompact is true.',
    },
    {
      name: 'isCompact',
      type: 'boolean',
      description:
        'Enables the compact variant with reduced spacing for constrained content areas.',
      default: 'false',
    },
  ],
  accessibility: [
    'Container uses role="status" to announce the empty state content to screen readers.',
    'Icon wrapper has aria-hidden="true" so decorative icons are ignored by assistive technology.',
    'Title renders as an <h3> element, keeping it in the document heading outline.',
  ],
};
