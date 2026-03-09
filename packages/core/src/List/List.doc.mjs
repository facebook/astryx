/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'List',
  description:
    'Vertical list component for rendering collections of items with consistent spacing, dividers, and marker styles. Uses a composition model: XDSList wraps XDSListItem sub-components.',
  features: [
    'Composition model — XDSList wraps XDSListItem sub-components',
    'Density variants: compact, balanced, spacious',
    'Optional dividers between items',
    'Optional header associated via aria-labelledby',
    'List marker styles: none, disc, decimal (renders <ol>), circle',
    'Interactive items via invisible button or anchor pattern',
    'Start and end content slots (icon, avatar, badge, chevron)',
  ],
  examples: [
    {
      label: 'Basic list',
      code: `<XDSList>
  <XDSListItem label="Notifications" description="Manage your alerts" />
  <XDSListItem label="Privacy" description="Control your data" />
</XDSList>`,
    },
    {
      label: 'With dividers and header',
      code: `<XDSList hasDividers header={<strong>Team Members</strong>}>
  <XDSListItem
    label="Alice Johnson"
    description="Engineering"
    startContent={<XDSIcon icon={UserIcon} />}
  />
  <XDSListItem
    label="Bob Smith"
    description="Design"
    startContent={<XDSIcon icon={UserIcon} />}
  />
</XDSList>`,
    },
    {
      label: 'Interactive items',
      code: `<XDSList>
  <XDSListItem label="Settings" onClick={() => navigate('/settings')} />
  <XDSListItem label="Docs" href="/docs" target="_blank" />
</XDSList>`,
    },
    {
      label: 'Ordered list',
      code: `<XDSList listStyle="decimal">
  <XDSListItem label="First step" />
  <XDSListItem label="Second step" />
</XDSList>`,
    },
  ],
  accessibility: [
    'Semantic <ul> / <ol> with <li> elements',
    'role="list" added when listStyle=\'none\' (Safari fix for list semantics removed by CSS list-style:none)',
    'aria-labelledby links the header element to the list',
    'aria-selected on selected items',
    'aria-disabled on disabled items',
    'Dividers are aria-hidden="true"',
    'Interactive items are keyboard-focusable via Tab',
  ],
  theming: {
    targets: [
      {className: 'xds-list', visualProps: ['density', 'listStyle']},
      {className: 'xds-list-item'},
    ],
  },
  notes: [
    'Invisible button pattern: when onClick is provided, an invisible <button> wraps the label + description for accessibility. The <li> is the visual container with hover/press styles. startContent and endContent are siblings to the button (not inside it). Container click fires onClick unless the click originated from an interactive child. :focus-within on the container shows the focus outline.',
    'When href is provided instead of onClick, the same invisible pattern uses an <a> element.',
  ],
  components: [
    {
      name: 'XDSList',
      description: 'List container with density, dividers, and header support.',
      examples: [
        {
          label: 'With dividers and header',
          code: `<XDSList hasDividers header={<strong>Team Members</strong>}>
  <XDSListItem label="Alice" description="Engineering" />
  <XDSListItem label="Bob" description="Design" />
</XDSList>`,
        },
      ],
      props: [
        {
          name: 'children',
          type: 'ReactNode',
          description: 'List items (XDSListItem components).',
        },
        {
          name: 'density',
          type: "'compact' | 'balanced' | 'spacious'",
          description: 'Spacing density for items.',
          default: "'balanced'",
        },
        {
          name: 'hasDividers',
          type: 'boolean',
          description: 'Show dividers between items.',
          default: 'false',
        },
        {
          name: 'header',
          type: 'ReactNode',
          description:
            'Header content, associated with the list via aria-labelledby.',
        },
        {
          name: 'listStyle',
          type: "'none' | 'disc' | 'decimal' | 'circle'",
          description:
            "List marker style. 'decimal' renders an <ol> element instead of <ul>.",
          default: "'none'",
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value — not an inline style object like style={{}}.',
        },
      ],
    },
    {
      name: 'XDSListItem',
      description:
        'List item with label, description, start/end content slots, and interactive patterns.',
      examples: [
        {
          label: 'With icon and click handler',
          code: `<XDSListItem
  label="Settings"
  description="Manage your preferences"
  startContent={<XDSIcon icon={CogIcon} />}
  onClick={() => navigate('/settings')}
/>`,
        },
      ],
      props: [
        {
          name: 'label',
          type: 'string',
          description: 'Primary text.',
          required: true,
        },
        {
          name: 'description',
          type: 'string',
          description: 'Secondary text displayed below the label.',
        },
        {
          name: 'startContent',
          type: 'ReactNode',
          description:
            'Content rendered before the label area (e.g. icon, avatar).',
        },
        {
          name: 'endContent',
          type: 'ReactNode',
          description:
            'Content rendered after the label area (e.g. badge, chevron).',
        },
        {
          name: 'onClick',
          type: '(e: MouseEvent) => void',
          description: 'Click handler; enables the invisible button pattern.',
        },
        {
          name: 'href',
          type: 'string',
          description: 'Link URL; enables the invisible anchor pattern.',
        },
        {
          name: 'target',
          type: 'string',
          description:
            'Link target attribute, only applicable when href is provided.',
        },
        {
          name: 'isDisabled',
          type: 'boolean',
          description: 'Disabled state; sets aria-disabled on the item.',
          default: 'false',
        },
        {
          name: 'isSelected',
          type: 'boolean',
          description: 'Selected state; sets aria-selected on the item.',
          default: 'false',
        },
      ],
    },
  ],
};
