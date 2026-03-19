/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'SegmentedControl',
  description:
    'Segmented button group for single selection with radio group semantics. Visually resembles a tab bar but controls a value, not a view.',
  features: [
    'Context-based communication: XDSSegmentedControlContext passes value/onChange/size/isDisabled from parent to children',
    'Radio group semantics: role="radiogroup" with role="radio" items and aria-checked',
    'Roving tabindex: only the selected item is tabbable (tabIndex=0), others are tabIndex=-1',
    'Keyboard navigation: ArrowLeft/ArrowRight navigate + select, Home/End jump to first/last, wraps around',
    'Animated indicator: selected item has a raised surface background with box-shadow',
    'Icon + label or icon-only items (isLabelHidden hides label visually, keeps it as aria-label)',
    'Size variants: sm (compact for toolbars), md (default), lg (larger touch targets)',
    'Disabled state: entire group or individual items via aria-disabled (maintains focusability)',
    'Hover state: unselected items show overlay on hover with @media (hover: hover) guard',
  ],
  examples: [
    {
      label: 'Basic',
      code: `<XDSSegmentedControl value={view} onChange={setView} label="View mode">
  <XDSSegmentedControlItem value="grid" label="Grid" />
  <XDSSegmentedControlItem value="list" label="List" />
  <XDSSegmentedControlItem value="table" label="Table" />
</XDSSegmentedControl>`,
    },
    {
      label: 'With icons',
      code: `<XDSSegmentedControl value={view} onChange={setView} label="View mode">
  <XDSSegmentedControlItem value="grid" label="Grid" icon={<XDSIcon icon={Squares2X2Icon} color="inherit" />} />
  <XDSSegmentedControlItem value="list" label="List" icon={<XDSIcon icon={ListBulletIcon} color="inherit" />} />
  <XDSSegmentedControlItem value="table" label="Table" icon={<XDSIcon icon={TableCellsIcon} color="inherit" />} />
</XDSSegmentedControl>`,
    },
    {
      label: 'Icon-only compact',
      code: `<XDSSegmentedControl value={view} onChange={setView} label="View mode" size="sm">
  <XDSSegmentedControlItem value="grid" label="Grid" isLabelHidden icon={<XDSIcon icon={Squares2X2Icon} color="inherit" />} />
  <XDSSegmentedControlItem value="list" label="List" isLabelHidden icon={<XDSIcon icon={ListBulletIcon} color="inherit" />} />
</XDSSegmentedControl>`,
    },
    {
      label: 'Disabled',
      code: `<XDSSegmentedControl value={view} onChange={setView} label="View mode" isDisabled>
  <XDSSegmentedControlItem value="grid" label="Grid" />
  <XDSSegmentedControlItem value="list" label="List" />
</XDSSegmentedControl>`,
    },
  ],
  theming: {
    targets: [
      {className: 'xds-segmented-control', visualProps: ['size']},
      {className: 'xds-segmented-control-item'},
    ],
  },
  accessibility: [
    'Container has role="radiogroup" with aria-label from the label prop (never rendered visually)',
    'Items have role="radio" with aria-checked indicating selection state',
    'Roving tabindex: selected item has tabIndex=0, others have tabIndex=-1',
    'Arrow keys navigate and select simultaneously (radio group pattern)',
    'Disabled items use aria-disabled (not native disabled) to maintain focusability',
    'Icon-only items use isLabelHidden — label becomes aria-label',
  ],
  keyboard:
    'ArrowRight/ArrowLeft navigate and select (wrapping). Home/End jump to first/last item. Only the selected item is in the tab order.',
  notes: [
    'Controlled-only — no uncontrolled mode in v1',
    'Horizontal-only — no vertical orientation in v1',
    'Deselection not allowed (radio semantics — always one selected)',
    'Uses aria-disabled instead of native disabled to maintain keyboard focusability',
    'Keyboard navigation skips disabled items',
    'Track background uses --color-secondary, selected indicator uses --color-surface with --shadow-base',
    'label prop on XDSSegmentedControl is aria-only (like XDSTabList aria-label), never rendered visually',
  ],
  components: [
    {
      name: 'XDSSegmentedControl',
      description:
        'Container wrapper providing context (value, onChange, size, isDisabled) to XDSSegmentedControlItem children.',
      props: [
        {
          name: 'value',
          type: 'string',
          description: 'The currently selected value (controlled).',
          required: true,
        },
        {
          name: 'onChange',
          type: '(value: string) => void',
          description: 'Callback fired when a segment is selected.',
          required: true,
        },
        {
          name: 'label',
          type: 'string',
          description:
            'Accessible label for the radio group (used as aria-label, never rendered visually).',
          required: true,
        },
        {
          name: 'size',
          type: "'sm' | 'md' | 'lg'",
          description: 'Size variant for the control.',
          default: "'md'",
        },
        {
          name: 'isDisabled',
          type: 'boolean',
          description: 'Whether the entire control is disabled.',
          default: 'false',
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: 'XDSSegmentedControlItem children.',
          required: true,
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description: 'Additional StyleX styles for the container.',
        },
      ],
      examples: [
        {
          label: 'Basic',
          code: `<XDSSegmentedControl value={view} onChange={setView} label="View mode">
  <XDSSegmentedControlItem value="grid" label="Grid" />
  <XDSSegmentedControlItem value="list" label="List" />
  <XDSSegmentedControlItem value="table" label="Table" />
</XDSSegmentedControl>`,
        },
      ],
    },
    {
      name: 'XDSSegmentedControlItem',
      description:
        'Individual segment item rendering as a radio button within the segmented control.',
      props: [
        {
          name: 'value',
          type: 'string',
          description:
            'Unique value for this segment, matched against the parent value.',
          required: true,
        },
        {
          name: 'label',
          type: 'string',
          description:
            'Accessible label for this segment. Rendered as visible text unless isLabelHidden is true.',
          required: true,
        },
        {
          name: 'isLabelHidden',
          type: 'boolean',
          description:
            'Whether the label is visually hidden. When true, only the icon is displayed and label is used as aria-label.',
          default: 'false',
        },
        {
          name: 'icon',
          type: 'ReactNode',
          description: 'Icon element displayed before the label.',
        },
        {
          name: 'isDisabled',
          type: 'boolean',
          description: 'Whether this individual item is disabled.',
          default: 'false',
        },
      ],
      examples: [
        {
          label: 'With icon and label',
          code: '<XDSSegmentedControlItem value="grid" label="Grid" icon={<XDSIcon icon={Squares2X2Icon} color="inherit" />} />',
        },
        {
          label: 'Icon-only',
          code: '<XDSSegmentedControlItem value="grid" label="Grid" isLabelHidden icon={<XDSIcon icon={Squares2X2Icon} color="inherit" />} />',
        },
      ],
    },
  ],
};
