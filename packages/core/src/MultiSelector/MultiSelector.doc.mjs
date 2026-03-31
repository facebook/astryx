/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'MultiSelector',
  description:
    'Multi-select dropdown with checkboxes for choosing multiple items from a list. For small, finite sets like column toggles or filter facets — not a replacement for XDSTokenizer.',
  features: [
    'Checkbox-based multi-select — dropdown stays open on toggle',
    'Supports string items, object items with optional icon and disabled state, dividers, and labeled sections',
    'Optional select-all with indeterminate state',
    'Optional search filtering',
    'Three trigger display modes: count, labels, badges',
    'Integrates with XDS field conventions: label, description, isRequired, isOptional, isLabelHidden, status',
    'Size variants: sm, md, lg',
    'Full keyboard navigation with typeahead support',
    'Accessible — role="combobox" trigger, role="listbox" with aria-multiselectable, real checkbox inputs',
  ],
  keyboard:
    '↑↓ navigate, Enter/Space toggle, Escape close, Home/End jump, A-Z typeahead (when search not shown).',
  accessibility: [
    'Uses role="combobox" on the trigger button.',
    'Dropdown listbox uses aria-multiselectable="true".',
    'Each option uses role="option" with aria-selected.',
    'Real XDSCheckboxInput for each item — no fake checkboxes.',
    'Select-all checkbox rendered outside role="listbox".',
    'Search input uses role="searchbox" with aria-controls.',
  ],
  theming: {
    targets: [
      {className: 'xds-multi-selector', visualProps: ['size', 'status']},
    ],
  },
  examples: [
    {
      label: 'Basic',
      code: `<XDSMultiSelector
  label="Columns"
  options={['Name', 'Email', 'Role', 'Status']}
  value={selected}
  onChange={setSelected}
/>`,
    },
    {
      label: 'With select all and search',
      code: `<XDSMultiSelector
  label="Columns"
  options={['Name', 'Email', 'Role', 'Status', 'Created']}
  value={selected}
  onChange={setSelected}
  hasSelectAll
  hasSearch
/>`,
    },
    {
      label: 'Badges trigger display',
      code: `<XDSMultiSelector
  label="Filters"
  options={['Active', 'Inactive', 'Pending', 'Archived']}
  value={selected}
  onChange={setSelected}
  triggerDisplay="badges"
  maxBadges={2}
/>`,
    },
    {
      label: 'Sections',
      code: `<XDSMultiSelector
  label="Permissions"
  options={[
    {type: 'section', title: 'Read', options: [
      {value: 'read_posts', label: 'Read posts'},
      {value: 'read_comments', label: 'Read comments'},
    ]},
    {type: 'section', title: 'Write', options: [
      {value: 'write_posts', label: 'Write posts'},
      {value: 'write_comments', label: 'Write comments'},
    ]},
  ]}
  value={selected}
  onChange={setSelected}
/>`,
    },
  ],
  components: [
    {
      name: 'XDSMultiSelector',
      description:
        'Multi-select dropdown with checkboxes for choosing multiple items.',
      props: [
        {
          name: 'label',
          type: 'string',
          description: 'Label text for accessibility.',
          required: true,
        },
        {
          name: 'options',
          type: 'XDSMultiSelectorOptionType[]',
          description:
            'Array of items — strings, objects with value/label/icon/disabled, dividers, or sections.',
          required: true,
        },
        {
          name: 'value',
          type: 'string[]',
          description: 'Currently selected values.',
          required: true,
        },
        {
          name: 'onChange',
          type: '(value: string[]) => void',
          description: 'Callback fired when the selection changes.',
          required: true,
        },
        {
          name: 'onChangeAction',
          type: '(value: string[]) => void | Promise<void>',
          description: 'Async action on change. Fires after onChange.',
        },
        {
          name: 'placeholder',
          type: 'string',
          description: 'Placeholder text shown when no value is selected.',
          default: "'Select...'",
        },
        {
          name: 'size',
          type: "'sm' | 'md' | 'lg'",
          description: 'Size variant for the selector.',
          default: "'md'",
        },
        {
          name: 'triggerDisplay',
          type: "'count' | 'labels' | 'badges'",
          description: 'How to display selected items in the trigger.',
          default: "'count'",
        },
        {
          name: 'maxBadges',
          type: 'number',
          description:
            'Maximum badges to show before "+N". Only for triggerDisplay="badges".',
          default: '3',
        },
        {
          name: 'hasSelectAll',
          type: 'boolean',
          description: 'Whether to show a select-all checkbox.',
        },
        {
          name: 'selectAllLabel',
          type: 'string',
          description: 'Label for the select-all checkbox.',
          default: "'Select all'",
        },
        {
          name: 'hasSearch',
          type: 'boolean',
          description: 'Whether to show a search input for filtering options.',
        },
        {
          name: 'searchPlaceholder',
          type: 'string',
          description: 'Placeholder text for the search input.',
          default: "'Search...'",
        },
        {
          name: 'isDisabled',
          type: 'boolean',
          description: 'Disables the selector.',
        },
        {
          name: 'isLabelHidden',
          type: 'boolean',
          description: 'Visually hides the label while keeping it accessible.',
        },
        {
          name: 'description',
          type: 'string',
          description: 'Helper text displayed below the label.',
        },
        {
          name: 'isOptional',
          type: 'boolean',
          description: 'Marks the field as optional.',
        },
        {
          name: 'isRequired',
          type: 'boolean',
          description: 'Marks the field as required.',
        },
        {
          name: 'isLoading',
          type: 'boolean',
          description: 'Shows a loading spinner in the trigger.',
        },
        {
          name: 'status',
          type: "{type: 'error' | 'warning' | 'success', message?: string}",
          description: 'Validation status with an optional message.',
        },
        {
          name: 'children',
          type: '(option: XDSMultiSelectorOptionData) => ReactNode',
          description: 'Custom render function for each option in the dropdown.',
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            'StyleX styles for layout customization. Must be a stylex.create() value.',
        },
      ],
      examples: [
        {
          label: 'Basic',
          code: `<XDSMultiSelector
  label="Columns"
  options={['Name', 'Email', 'Role']}
  value={selected}
  onChange={setSelected}
/>`,
        },
        {
          label: 'With select all',
          code: `<XDSMultiSelector
  label="Columns"
  options={['Name', 'Email', 'Role']}
  value={selected}
  onChange={setSelected}
  hasSelectAll
/>`,
        },
      ],
    },
  ],
};
