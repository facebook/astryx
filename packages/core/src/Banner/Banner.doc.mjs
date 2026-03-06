/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Banner',
  description:
    'Persistent status notification for info, warning, error, or success messages.',

  features: [
    'Two-part layout: colored status header with icon, title, description, action buttons, and optional dismiss; optional card-background content area below',
    'When no children are provided, only the colored header renders',
    'Self-managed dismiss state — banner hides itself on dismiss without requiring external state wiring',
    'onDismiss callback fires alongside the internal state change for logging or backend sync',
    'Default status icons from @heroicons/react/24/solid: InformationCircleIcon (info), ExclamationTriangleIcon (warning), XCircleIcon (error), CheckCircleIcon (success)',
    'Status colors: info uses --color-accent-deemphasized, warning uses --color-warning-deemphasized, error uses --color-negative-deemphasized, success uses --color-positive-deemphasized',
    'Card variant (default): has border-radius with optional card content area below the colored header',
    'Section variant: no border-radius, full-width for page-level banners',
  ],

  examples: [
    {
      label: 'Simple — just the colored header',
      code: '<XDSBanner status="info" title="New update available" />',
    },
    {
      label: 'With description and self-dismissing behavior',
      code: `<XDSBanner
  status="error"
  title="Something went wrong"
  description="Please try again later."
  isDismissable
  onDismiss={() => logDismiss()}
/>`,
    },
    {
      label: 'With content area (card background below header)',
      code: `<XDSBanner
  status="error"
  title="Multiple errors found"
  description="The following issues need to be resolved:"
>
  <ul>
    <li>Email address is invalid</li>
    <li>Password must be at least 8 characters</li>
  </ul>
</XDSBanner>`,
    },
  ],

  props: [
    {
      name: 'status',
      type: "'info' | 'warning' | 'error' | 'success'",
      description: 'Status type controlling icon and color.',
      required: true,
    },
    {
      name: 'title',
      type: 'ReactNode',
      description: 'Title text or ReactNode displayed in the header.',
      required: true,
    },
    {
      name: 'description',
      type: 'ReactNode',
      description: 'Description text rendered below the title in the header.',
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description: 'Override the default status icon.',
    },
    {
      name: 'isDismissable',
      type: 'boolean',
      description: 'Whether the banner can be dismissed by the user.',
      default: 'false',
    },
    {
      name: 'onDismiss',
      type: '() => void',
      description:
        'Called when the dismiss button is clicked; banner hides itself regardless of whether this is provided.',
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description:
        'Action content rendered in the header area, end-aligned. Typically a button or link.',
    },
    {
      name: 'variant',
      type: "'card' | 'section'",
      description:
        'Visual variant: card has border-radius; section is full-width with no border-radius for page-level use.',
      default: "'card'",
    },
    {
      name: 'children',
      type: 'ReactNode',
      description:
        'Content rendered in the card-background area below the colored header.',
    },
  ],

  accessibility: [
    'Uses role="alert" for error and warning statuses',
    'Uses role="status" for info and success statuses',
    'Dismiss button has aria-label="Dismiss"',
    'Status icon is aria-hidden="true" — status is conveyed by the ARIA role instead',
  ],

  notes: [
    'Collapsible support is planned: the content area will support collapsing via useXDSCollapsible (issue #187)',
  ],
};
