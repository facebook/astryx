/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Breadcrumbs',
  description: 'A navigation breadcrumb trail with semantic HTML.',
  features: [
    'Renders a <nav> landmark with an ordered list of breadcrumb items',
    'Configurable separator between items (defaults to /)',
    'Two visual variants: default and supporting (smaller, secondary text)',
    'Current page item is marked with aria-current="page"',
    'Separators are hidden from assistive technology via aria-hidden',
    'Supports icons before item labels via startIcon',
    'Auto-detects the last child as the current page when no isCurrent is set',
  ],
  examples: [
    {
      label: 'Basic',
      code: `<XDSBreadcrumbs>
  <XDSBreadcrumbItem href="/">Home</XDSBreadcrumbItem>
  <XDSBreadcrumbItem href="/projects">Projects</XDSBreadcrumbItem>
  <XDSBreadcrumbItem isCurrent>My Project</XDSBreadcrumbItem>
</XDSBreadcrumbs>`,
    },
    {
      label: 'Supporting variant',
      code: `<XDSBreadcrumbs variant="supporting">
  <XDSBreadcrumbItem href="/">Home</XDSBreadcrumbItem>
  <XDSBreadcrumbItem isCurrent>Page</XDSBreadcrumbItem>
</XDSBreadcrumbs>`,
    },
    {
      label: 'With icons',
      code: `<XDSBreadcrumbs>
  <XDSBreadcrumbItem href="/" startIcon={<XDSIcon icon={HomeIcon} size="sm" />}>
    Home
  </XDSBreadcrumbItem>
  <XDSBreadcrumbItem isCurrent>Settings</XDSBreadcrumbItem>
</XDSBreadcrumbs>`,
    },
    {
      label: 'Item with icon and click handler',
      code: `<XDSBreadcrumbItem href="/settings" startIcon={<XDSIcon icon={CogIcon} size="sm" />}>
  Settings
</XDSBreadcrumbItem>`,
    },
  ],
  theming: {
    targets: [
      {className: 'xds-breadcrumb-item'},
      {className: 'xds-breadcrumbs', visualProps: ['variant']},
    ],
  },
  accessibility: [
    'Container renders as a <nav aria-label> landmark; the label defaults to "Breadcrumb" and is customizable via the label prop',
    'Items are placed inside an <ol> with individual <li> wrappers for correct list semantics',
    'The current page item receives aria-current="page"',
    'Separators are rendered with aria-hidden="true" so screen readers skip them',
    'Auto-detects the last child as the current item when no isCurrent prop is explicitly set',
  ],
  components: [
    {
      name: 'XDSBreadcrumbs',
      description:
        'Navigation container that renders a <nav> with an ordered list of breadcrumb items.',
      props: [
        {
          name: 'children',
          type: 'ReactNode',
          description:
            'XDSBreadcrumbItem elements to render inside the breadcrumb trail.',
          required: true,
        },
        {
          name: 'separator',
          type: 'ReactNode',
          description: 'Separator rendered between breadcrumb items.',
          default: "'/'",
        },
        {
          name: 'variant',
          type: "'default' | 'supporting'",
          description:
            'Visual variant — supporting is smaller with secondary text styling.',
          default: "'default'",
        },
        {
          name: 'label',
          type: 'string',
          description: 'Accessible label for the nav landmark (aria-label).',
          default: "'Breadcrumb'",
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
          label: 'Basic',
          code: `<XDSBreadcrumbs>
  <XDSBreadcrumbItem href="/">Home</XDSBreadcrumbItem>
  <XDSBreadcrumbItem href="/projects">Projects</XDSBreadcrumbItem>
  <XDSBreadcrumbItem isCurrent>My Project</XDSBreadcrumbItem>
</XDSBreadcrumbs>`,
        },
        {
          label: 'Supporting variant',
          code: `<XDSBreadcrumbs variant="supporting">
  <XDSBreadcrumbItem href="/">Home</XDSBreadcrumbItem>
  <XDSBreadcrumbItem isCurrent>Page</XDSBreadcrumbItem>
</XDSBreadcrumbs>`,
        },
      ],
    },
    {
      name: 'XDSBreadcrumbItem',
      description:
        'Individual breadcrumb item that renders as a link when href is provided, or as plain text for the current page.',
      props: [
        {
          name: 'children',
          type: 'ReactNode',
          description: 'Label content for the breadcrumb item.',
          required: true,
        },
        {
          name: 'href',
          type: 'string',
          description:
            'URL the breadcrumb links to; omit for non-navigable items.',
        },
        {
          name: 'onClick',
          type: '(e: MouseEvent) => void',
          description: 'Click handler for the breadcrumb item.',
        },
        {
          name: 'isCurrent',
          type: 'boolean',
          description:
            'Marks this item as the current page, applying aria-current="page".',
          default: 'false',
        },
        {
          name: 'startIcon',
          type: 'ReactNode',
          description: 'Icon rendered before the item label.',
        },
      ],
      examples: [
        {
          label: 'Link item',
          code: `<XDSBreadcrumbItem href="/projects">Projects</XDSBreadcrumbItem>`,
        },
        {
          label: 'Current page item',
          code: `<XDSBreadcrumbItem isCurrent>My Project</XDSBreadcrumbItem>`,
        },
        {
          label: 'With icon',
          code: `<XDSBreadcrumbItem href="/settings" startIcon={<XDSIcon icon={CogIcon} size="sm" />}>
  Settings
</XDSBreadcrumbItem>`,
        },
      ],
    },
  ],
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {...docs};
