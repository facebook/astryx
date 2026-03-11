/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Typeahead',
  description:
    'Searchable dropdown components for single-item selection with keyboard navigation. Supports async and sync search via a searchSource interface.',
  features: [
    'Async and sync search via a searchSource interface with search() and bootstrap() methods',
    'Bootstrap results shown on focus before typing (via hasEntriesOnFocus)',
    'Edit mode: clicking selected token enters edit mode with text pre-populated and selected',
    'Combobox ARIA pattern for full accessibility',
    'Debounced search with configurable delay (default 150ms, set to 0 for synchronous sources)',
    'Two-layer architecture: XDSBaseTypeahead provides the engine, XDSTypeahead adds field chrome',
  ],
  examples: [
    {
      label: 'Basic typeahead',
      code: `const source = {
  search: query => fruits.filter(f => f.label.includes(query)),
  bootstrap: () => fruits.slice(0, 5),
};

<XDSTypeahead
  label="Fruit"
  searchSource={source}
  value={selected}
  onChange={setSelected}
  placeholder="Search fruits..."
/>`,
    },
    {
      label: 'With custom item rendering',
      code: `<XDSTypeahead
  label="Assignee"
  searchSource={userSource}
  value={assignee}
  onChange={setAssignee}
  placeholder="Search users..."
  hasEntriesOnFocus
  renderItem={(item) => (
    <XDSTypeaheadItem
      item={item}
      icon={<XDSAvatar src={item.auxiliaryData.avatar} size="sm" />}
      description={item.auxiliaryData.role}
    />
  )}
/>`,
    },
    {
      label: 'With validation status',
      code: `<XDSTypeahead
  label="Manager"
  searchSource={managerSource}
  value={manager}
  onChange={setManager}
  isRequired
  status={{ type: 'error', message: 'A manager is required' }}
/>`,
    },
  ],
  components: [
    {
      name: 'XDSTypeahead',
      description:
        'Styled typeahead with label, description, validation, and all field features. Wraps XDSBaseTypeahead with XDSField for the primary use case.',
      props: [
        {
          name: 'label',
          type: 'string',
          description: 'Accessible label for the input.',
          required: true,
        },
        {
          name: 'searchSource',
          type: 'XDSSearchSource<T>',
          description:
            'Data source providing search and bootstrap methods for populating the dropdown.',
          required: true,
        },
        {
          name: 'value',
          type: 'T | null',
          description:
            'Currently selected item, or null if nothing is selected.',
          required: true,
        },
        {
          name: 'onChange',
          type: '(item: T | null) => void',
          description: 'Called when the selection changes.',
          required: true,
        },
        {
          name: 'placeholder',
          type: 'string',
          description: 'Input placeholder text.',
        },
        {
          name: 'hasEntriesOnFocus',
          type: 'boolean',
          description: 'Show bootstrap results on focus before typing.',
          default: 'false',
        },
        {
          name: 'hasClear',
          type: 'boolean',
          description: 'Show clear button to deselect the current value.',
          default: 'true',
        },
        {
          name: 'isDisabled',
          type: 'boolean',
          description: 'Disables the input.',
          default: 'false',
        },
        {
          name: 'maxMenuItems',
          type: 'number',
          description: 'Maximum number of dropdown items to display.',
          default: '10',
        },
        {
          name: 'status',
          type: 'XDSInputStatus',
          description:
            'Validation status object with type and message for error/warning/success states.',
        },
        {
          name: 'renderItem',
          type: '(item: T) => ReactNode',
          description:
            'Custom render function for dropdown items. Default renders XDSTypeaheadItem.',
        },
        {
          name: 'isLabelHidden',
          type: 'boolean',
          description: 'Visually hides the label while keeping it accessible.',
          default: 'false',
        },
        {
          name: 'description',
          type: 'string',
          description: 'Helper text displayed below the label.',
        },
        {
          name: 'isRequired',
          type: 'boolean',
          description: 'Marks the field as required.',
          default: 'false',
        },
        {
          name: 'isOptional',
          type: 'boolean',
          description: 'Shows an optional indicator on the label.',
          default: 'false',
        },
        {
          name: 'labelTooltip',
          type: 'string',
          description: 'Tooltip text shown on the label.',
        },
        {
          name: 'emptySearchResultsText',
          type: 'string',
          description: 'Text shown when search returns no results.',
          default: "'No results found'",
        },
        {
          name: 'hasAutoFocus',
          type: 'boolean',
          description: 'Auto-focus the input on mount.',
          default: 'false',
        },
        {
          name: 'size',
          type: "'sm' | 'md'",
          description: 'Input and token size.',
          default: "'md'",
        },
        {
          name: 'debounceMs',
          type: 'number',
          description:
            'Debounce delay in ms before triggering search. Set to 0 for synchronous sources.',
          default: '150',
        },
        {
          name: 'onChangeQuery',
          type: '(query: string) => void',
          description: 'Callback fired when the search query text changes.',
        },
        {
          name: 'onOpenChange',
          type: '(isOpen: boolean) => void',
          description: 'Callback when the dropdown opens or closes.',
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
          code: `<XDSTypeahead
  label="Assignee"
  searchSource={userSource}
  value={assignee}
  onChange={setAssignee}
  placeholder="Search users..."
/>`,
        },
        {
          label: 'With bootstrap on focus',
          code: `<XDSTypeahead
  label="Project"
  searchSource={projectSource}
  value={project}
  onChange={setProject}
  hasEntriesOnFocus
  placeholder="Select a project..."
/>`,
        },
      ],
    },
    {
      name: 'XDSBaseTypeahead',
      description:
        'Unstyled combobox engine providing input, search, keyboard navigation, and dropdown. No wrapper div, no border styling, no token rendering. Used by XDSTypeahead and XDSTokenizer for custom compositions.',
      props: [
        {
          name: 'searchSource',
          type: 'XDSSearchSource<T>',
          description: 'Data source providing search and bootstrap methods.',
          required: true,
        },
        {
          name: 'value',
          type: 'T | null',
          description: 'Currently selected item.',
          required: true,
        },
        {
          name: 'onChange',
          type: '(item: T | null) => void',
          description: 'Called when the selection changes.',
          required: true,
        },
        {
          name: 'renderItem',
          type: '(item: T) => ReactNode',
          description: 'Custom render function for dropdown items.',
        },
        {
          name: 'placeholder',
          type: 'string',
          description: 'Input placeholder text.',
          default: "'Search...'",
        },
        {
          name: 'hasEntriesOnFocus',
          type: 'boolean',
          description: 'Show bootstrap results on focus before typing.',
          default: 'false',
        },
        {
          name: 'maxMenuItems',
          type: 'number',
          description: 'Maximum dropdown items to display.',
          default: '10',
        },
        {
          name: 'emptySearchResultsText',
          type: 'string',
          description: 'Text shown when search returns no results.',
          default: "'No results found'",
        },
        {
          name: 'isDisabled',
          type: 'boolean',
          description: 'Whether the input is disabled.',
          default: 'false',
        },
        {
          name: 'hasAutoFocus',
          type: 'boolean',
          description: 'Auto-focus the input on mount.',
          default: 'false',
        },
        {
          name: 'debounceMs',
          type: 'number',
          description:
            'Debounce delay in ms before triggering search. Set to 0 for synchronous sources.',
          default: '150',
        },
        {
          name: 'anchorRef',
          type: 'RefObject<HTMLElement | null>',
          description:
            'Ref to the anchor element for dropdown positioning. If not provided, the input itself is used.',
        },
        {
          name: 'inputXStyle',
          type: 'StyleXStyles',
          description: 'Additional StyleX styles for the input element.',
        },
        {
          name: 'onKeyDown',
          type: '(e: React.KeyboardEvent<HTMLInputElement>) => void',
          description:
            'Additional keydown handler called before internal keyboard navigation. Call e.preventDefault() to skip internal handling.',
        },
        {
          name: 'onChangeQuery',
          type: '(query: string) => void',
          description: 'Callback fired when the search query text changes.',
        },
        {
          name: 'onOpenChange',
          type: '(isOpen: boolean) => void',
          description: 'Callback when the dropdown opens or closes.',
        },
        {
          name: 'inputId',
          type: 'string',
          description: 'ID for the input element (for label association).',
        },
        {
          name: 'ariaDescribedBy',
          type: 'string',
          description: 'Additional aria-describedby IDs.',
        },
      ],
      examples: [
        {
          label: 'With custom wrapper',
          code: `<XDSBaseTypeahead
  searchSource={source}
  value={selected}
  onChange={setSelected}
  anchorRef={wrapperRef}
  placeholder="Search..."
/>`,
        },
      ],
    },
    {
      name: 'XDSTypeaheadItem',
      description:
        'Default dropdown item renderer for typeahead results. Shows label with optional icon, description, and avatar. Exported for use in custom renderItem implementations.',
      props: [
        {
          name: 'item',
          type: 'XDSSearchableItem',
          description: 'The search result item to render.',
          required: true,
        },
        {
          name: 'icon',
          type: 'ReactNode',
          description: 'Icon or avatar to display before the label.',
        },
        {
          name: 'description',
          type: 'string',
          description: 'Description text displayed below the label.',
        },
        {
          name: 'isDisabled',
          type: 'boolean',
          description: 'Whether this item is visually disabled.',
          default: 'false',
        },
        {
          name: 'group',
          type: 'string',
          description: 'Group label for grouping items visually.',
        },
      ],
      examples: [
        {
          label: 'Custom renderItem with icon and description',
          code: `<XDSTypeaheadItem
  item={user}
  icon={<XDSAvatar src={user.auxiliaryData.avatar} size="sm" />}
  description={user.auxiliaryData.role}
/>`,
        },
      ],
    },
  ],
  accessibility: [
    'Uses combobox ARIA pattern with role="combobox", aria-expanded, aria-autocomplete="list".',
    'Dropdown uses role="listbox" with role="option" on each item.',
    'aria-activedescendant tracks the highlighted option.',
    'Selected item has aria-selected="true".',
    'Loading state has role="status" with aria-label="Loading".',
    'XDSTypeahead wraps in XDSField for label and description association.',
  ],
  keyboard:
    'Arrow keys navigate dropdown items; Enter selects highlighted item; Escape closes dropdown or restores previous value in edit mode; Home/End jump to first/last item',
  theming: {
    targets: [
      {className: 'xds-typeahead-item'},
    ],
  },
  notes: [
    'XDSSearchSource requires items to implement XDSSearchableItem ({ id: string; label: string; [key: string]: unknown }).',
    'Edit mode in XDSTypeahead: clicking the selected token removes it visually, populates the input with the label text, and selects all. Blurring without selecting restores the original token.',
    'XDSBaseTypeahead renders only the <input> and dropdown popover — consumers provide their own wrapper.',
    'If item has an element property, XDSTypeaheadItem renders it directly instead of the standard layout.',
  ],
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {...docs};
